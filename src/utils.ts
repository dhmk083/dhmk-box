import {KeyOf} from './types'

export function identity<T>(x: T) { return x }
export function noop() {}

// array
export function arrayReplace<T>(a: T[], b: ReadonlyArray<T>) {
  const len = a.length = b.length

  for (let i = 0; i < len; ++i) {
    a[i] = b[i]
  }
}

export function arrayRemove<T>(a: T[], fn: (x: T, i: number) => boolean) {
  const len = a.length

  for (let i = 0; i < len; ++i) {
    if (fn(a[i], i)) {
      a.splice(i, 1)
      i--
    }
  }
}

export function arrayToObject<K extends string, V>(arr: ReadonlyArray<[K, V]>): Record<K, V> {
  const r: any = {}

  for (const [k, v] of arr) {
    r[k] = v
  }

  return r
}
// array

// object
export function objectMap<T extends {}, K extends KeyOf<T>, R>(
  obj: T,
  fn: (v: T[K], k: K) => R
): Record<K, R> {
  const r: any = {}

  for (const k in obj) {
    r[k] = fn(obj[k as K], k as K)
  }

  return r
}
// object

export function sid() {
  let i = 0

  return () => {
    if (!Number.isSafeInteger(i++)) throw new RangeError('sid depleted')

    return i.toString()
  }
}

type KeyGetFn<T> = (x: T) => string

export function keyGetter<T>(k?: string | number | KeyGetFn<T>): KeyGetFn<T> {
  if (typeof k === 'function') return k
  if (k) return (x: any) => x[k].toString()
  return (x: any) => (x.key || x.id || '').toString()
}
