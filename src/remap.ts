import * as t from './types'
import {Changeable} from './ch'

class ReMapCore<K, V> extends Changeable<ReadonlyMap<K, V>> {
  get size()  { return this.value.size }

  constructor(
    readonly value: Map<K, V>
  ) {super()}

  replace(map: ReadonlyMap<K, V>) {
    this.value.clear()

    for (const [k, v] of map) {
      this.value.set(k, v)
    }

    this._update()
    return this
  }

  remove(fn: (v: V, k: K) => boolean, count?: number) {
    count = count === undefined ? this.value.size : count

    for (const [k, v] of this.value) {
      if (!count) break

      if (fn(v, k)) {
        this.value.delete(k)
        count--
      }
    }

    this._update()
    return this
  }

  private _update() {
    this.notify(this.value)
  }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

// mutating - notify
;[
  'clear', 'delete', 'set'
].forEach(k => {
  // @ts-ignore
  ReMapCore.prototype[k] = function(this: any, ...args) {
    // @ts-ignore
    const res = (this.value[k])(...args)
    this._update()
    return res
  }
})

// readonly - no notify
;[
  'entries', 'forEach', 'get', 'has', 'keys', 'values',
  'toLocaleString', 'toString', 'values', Symbol.iterator
].forEach(k => {
  // @ts-ignore
  ReMapCore.prototype[k] = function(...args) {
    // @ts-ignore
    return (this.value[k])(...args)
  }
})

export function remap<K, V>(initial: Map<K, V> = new Map()): t.ReMap<K, V> {
  return new ReMapCore<K, V>(initial) as any
}
