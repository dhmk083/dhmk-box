import {IDescriptor, Validator, Descriptors} from './types'
import {descriptor} from './descriptor'
import {objectMap} from '../utils'
import {choices} from './validators'

type Primitive = string | number | boolean | null | undefined

// patch optional
type OptionalPropertyNames<T> = {
  [K in keyof T]: undefined extends T[K] ? K : never
}[keyof T]

type OptionalProperties<T> = Pick<T, OptionalPropertyNames<T>>

type RequiredPropertyNames<T> = {
  [K in keyof T]: undefined extends T[K] ? never : K
}[keyof T]

type RequiredProperties<T> = Pick<T, RequiredPropertyNames<T>>

type PatchOptional<T extends {}> = RequiredProperties<T> & Partial<OptionalProperties<T>>
// patch optional

function makeObjectInitial<T extends {}>(descriptors: Descriptors<T>): T {
  return objectMap(descriptors, x => x.default()) as any
}

export function castNumber(x: any) {
  return isNaN(x) ? x : Number(x)
}

// ---

function literal<T extends Primitive>(initial: T, ...rest: T[]): IDescriptor<T>
function literal<T extends Primitive>(...args: any[]): IDescriptor<T> {
  // allows validator.meta.choices
  const validator = choices(args)

  return descriptor({
    type: 'literal',
    _default: args[0],
    validateImpl(x: any, /*ignore validator*/) {
      return validator(x)
    },
    validator,
  })
}

function union<A, B>(a: IDescriptor<A>, b: IDescriptor<B>): IDescriptor<A | B>
function union<A, B, C>(a: IDescriptor<A>, b: IDescriptor<B>, c: IDescriptor<C>): IDescriptor<A | B | C>
function union<A, B, C, D>(a: IDescriptor<A>, b: IDescriptor<B>, c: IDescriptor<C>, d: IDescriptor<D>): IDescriptor<A | B | C | D>
function union<A, B, C, D, E>(a: IDescriptor<A>, b: IDescriptor<B>, c: IDescriptor<C>, d: IDescriptor<D>, e: IDescriptor<E>): IDescriptor<A | B | C | D | E>
function union<A, B, C, D, E, F>(a: IDescriptor<A>, b: IDescriptor<B>, c: IDescriptor<C>, d: IDescriptor<D>, e: IDescriptor<E>, f: IDescriptor<F>): IDescriptor<A | B | C | D | E | F>
function union(...args: IDescriptor<any>[]) {
  return descriptor({
    type: 'union',
    _default: args[0].default(),
    meta: args,
    validateImpl(x: any, v?: Validator<any>) {
      for (const a of args) {
        if (!a.validate(x)) {
          if (!v) return
          if (!v(x)) return
        }
      }
      return this.typeErrorMessage()(x, this)
    },
  })
}

function object<T extends {}>(descriptors: Descriptors<T>, _default?: T): IDescriptor<PatchOptional<T>> {
  return descriptor({
    type: 'object',
    _default: _default || makeObjectInitial(descriptors) as any,
    meta: descriptors,
    validateImpl(x: any, v?: Validator<PatchOptional<T>>) {
      if (!x || typeof x !== 'object') return this.typeErrorMessage()(x, this)

      for (const k in x) {
        if (!(k in descriptors)) return this.typeErrorMessage()(x, this)
      }

      for (const k in descriptors) {
        const d = descriptors[k]
        if (!d) return this.typeErrorMessage()(x, this)

        const e = d.validate(x[k])
        if (e) return this.typeErrorMessage()(x, this)
      }

      if (v) return v(x)
    },
  })
}

function array<T>(d: IDescriptor<T>, _default: ReadonlyArray<T> = []): IDescriptor<ReadonlyArray<T>> {
  return descriptor<ReadonlyArray<T>>({
    type: 'array',
    _default: _default as any,
    meta: d,
    validateImpl(x: any, v?: Validator<ReadonlyArray<T>>) {
      if (!Array.isArray(x)) return this.typeErrorMessage()(x, this)

      for (const item of x) {
        const e = d.validate(item)
        if (e) return e
      }

      if (v) return v(x)
    },
  })
}

function map<K, V>(kd: IDescriptor<K>, vd: IDescriptor<V>, _default: ReadonlyMap<K, V> = new Map()): IDescriptor<ReadonlyMap<K, V>> {
  return descriptor<ReadonlyMap<K, V>>({
    type: 'map',
    _default: _default as any,
    meta: [kd, vd],
    validateImpl(x: any, v?: Validator<ReadonlyMap<K, V>>) {
      if (!(x instanceof Map)) return this.typeErrorMessage()(x, this)

      for (const [k, v] of x) {
        const ke = kd.validate(k)
        if (ke) return ke

        const ve = vd.validate(v)
        if (ve) return ve
      }

      if (v) return v(x)
    },
    cast: x => {
      try {
        return new Map(x as any)
      }
      catch {
        return x
      }
    }
  })
}

function _null(): IDescriptor<null> {
  return descriptor({
    type: 'null',
    _default: null,
    validateImpl(x: any) {
      if (x !== null) return this.typeErrorMessage()(x, this)
    },
  })
}

function opt<T>(d: IDescriptor<T>): IDescriptor<T | undefined> {
  return descriptor<T | undefined>({
    type: 'optional',
    _default: d.default(),
    meta: d,
    validateImpl(x: any, /*ignore validator*/) {
      if (x === undefined) return
      return d.validate(x)
    },

    cast: (x: any) => x === undefined ? x : d.cast(x),
    label: d.label(),
    description: d.description(),
  })
}

function number(_default = 0, validator?: Validator<number>): IDescriptor<number> {
  return descriptor({
    type: 'number',
    _default,
    validator,
    validateImpl(x: any, v?: Validator<number>) {
      if (typeof x !== 'number') return this.typeErrorMessage()(x, this)
      if (v) return v(x)
    },
    cast: castNumber,
  })
}

function string(_default = '', validator?: Validator<string>): IDescriptor<string> {
  return descriptor({
    type: 'string',
    _default,
    validator,
    validateImpl(x: any, v?: Validator<string>) {
      if (typeof x !== 'string') return this.typeErrorMessage()(x, this)
      if (v) return v(x)
    },
  })
}

function boolean(_default = false): IDescriptor<boolean> {
  return descriptor({
    type: 'boolean',
    _default,
    validateImpl(x: any, v?: Validator<boolean>) {
      if (typeof x !== 'boolean') return this.typeErrorMessage()(x, this)
      if (v) return v(x)
    },
  })
}

export const d = {
  literal,
  union,
  object,
  array,
  map,
  opt,
  number,
  string,
  boolean,
  null: _null,
  // date
  // any/custom
}
