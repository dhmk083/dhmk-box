import {Validator} from './types'

type WithMeta = {meta: {}}

function hasMeta(f: any): f is WithMeta {
  return typeof f.meta === 'object'
}

export function combine(...args: Validator<any>[]) {
  const validator: any = (x: any) => {
    for (const f of args) {
      const r = f(x)
      if (r) return r
    }
  }

  for (const f of args) {
    if (!hasMeta(f)) return

    validator.meta = {
      ...validator.meta,
      ...f.meta,
    }
  }

  return validator as Validator<any>
}

export function choices(a: ReadonlyArray<any>) {
  if (!a.length) throw new Error('Empty choices are not allowed.')

  function v(x: any) { if (!a.includes(x)) return `Value must be one of the following: ${a}.` }

  v.meta = {
    choices: a
  }

  return v
}

type RangeErrorMessage = (x: any, min: number, max: number) => string

export function range(min: number, max: number, errorMessage?: RangeErrorMessage) {
  function v(x: any) { if (x < min || x > max) return (errorMessage || range.errorMessage)(x, min, max) }

  v.meta = {
    min,
    max
  }

  return v
}

range.errorMessage = ((_, min, max) => `Value must be in range [${min}, ${max}].`) as RangeErrorMessage

export function required(msg?: string) {
  function v(x: any) { if (!x) return msg || 'Value is required.' }

  v.meta = {
    required: true
  }

  return v
}

export function eq(val: any) {
  function v(x: any) { if (x !== val) return `Value must be equal to ${val}.` }

  v.meta = {
    eq: val
  }

  return v
}
