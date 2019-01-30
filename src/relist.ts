import * as t from './types'
import {Changeable} from './ch'
import {arrayReplace, arrayRemove} from './utils'

class ReListCore<T> extends Changeable<ReadonlyArray<T>> {
  get length()  { return this.value.length }
  set length(x) { this.value.length = x; this._update() }

  constructor(
    readonly value: T[]
  ) {super()}

  get(index: number) {
    return this.value[index]
  }

  set(index: number, value: T) {
    this.value[index] = value
    this._update()
    return this
  }

  replace(arr: ReadonlyArray<T>) {
    arrayReplace(this.value, arr)
    this._update()
    return this
  }

  remove(fn: (x: T, i: number) => boolean, count?: number) {
    count = count === undefined ? this.value.length : count

    arrayRemove(
      this.value,
      (x, i) => {
        if (!count) return false

        if (fn(x, i)) {
          count--
          return true
        }
        else return false
      }
    )

    this._update()
    return this
  }

  private _update() {
    this.notify(this.value)
  }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array

// mutating - notify
;[
  'copyWithin', 'fill', 'pop', 'push', 'reverse',
  'shift', 'sort', 'splice', 'unshift'
].forEach(k => {
  // @ts-ignore
  ReListCore.prototype[k] = function(this: any, ...args) {
    // @ts-ignore
    const res = (this.value[k])(...args)
    this._update()
    return res
  }
})

// readonly - no notify
;[
  'concat', 'entries', 'every', 'filter', 'find', 'findIndex',
  'forEach', 'includes', 'indexOf', 'join', 'keys', 'lastIndexOf',
  'map', 'reduce', 'reduceRight', 'slice', 'some', 'toLocaleString',
  'toString', 'values', Symbol.iterator
].forEach(k => {
  // @ts-ignore
  ReListCore.prototype[k] = function(...args) {
    // @ts-ignore
    return (this.value[k])(...args)
  }
})

export function relist<T>(initial: T[] = []): t.ReList<T> {
  return new ReListCore<T>(initial) as any
}
