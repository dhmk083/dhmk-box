import {IChangeable, IObservable, Omit} from './types'
import {subj} from './core'

type TKeys<T> = Exclude<keyof T, 'changed'>
type StripChanged<T> = T extends {changed: any} ? Omit<T, 'changed'> : T
type TChangeable<T, U> = StripChanged<T> & IChangeable<U>

export function changeable<T extends {}>(target: StripChanged<T>): TChangeable<T, TKeys<T>>
export function changeable<T extends {}, U>(target: StripChanged<T>): TChangeable<T, U>
export function changeable(target: any) {
  const keys = Object.keys(target).filter(x => x !== 'changed')

  function Changeable(this: any) {
    this._$INST$ = target
    this.changed = this._$INST$.changed || subj()
    this.notify = this.notify || this.changed.next.bind(this.changed)
  }

  Changeable.prototype = Object.create(Object.getPrototypeOf(target))
  Changeable.prototype.constructor = Changeable

  for (const k of keys) {
    makePropNotifier(Changeable.prototype, k)
  }

  return new (Changeable as any)()
}

export class Changeable<T = void> implements IChangeable<T> {
  readonly changed: IObservable<T> = subj<T>()

  protected notify(x: T) {
    (this.changed as any).next(x)
  }
}

export function notify(proto: any, name: string, descriptor?: PropertyDescriptor) {
  return (
    descriptor ?
      descriptor.value ?
        makeMethodNotifier(descriptor) :
        makeAccessorNotifier(name, descriptor)
      :
      makePropNotifier(proto, name)
  )
}

function makeMethodNotifier(desc: PropertyDescriptor) {
  const fn = desc.value

  desc.value = function(this: any) {
    let res

    try {
      res = fn.apply(this, arguments)
    }
    finally {
      if (res && typeof res.then === 'function') {
        return res.then(
          (x: any) => { this.notify(); return x},
          (e: any) => { this.notify(); throw e }
        )
      }
      else {
        this.notify()
        return res
      }
    }
  }
}

function makePropNotifier(proto: any, key: string) {
  if (!proto._$GET_INST$) {
    proto._$GET_INST$ = function() {
      if (!this._$INST$) this._$INST$ = {}
      return this._$INST$
    }
  }

  Object.defineProperty(proto, key, {
    get() { return this._$GET_INST$()[key] },
    set(x: any) { this._$GET_INST$()[key] = x; this.notify(key) },
    enumerable: true
  })
}

function makeAccessorNotifier(key: string, desc: PropertyDescriptor) {
  if (!desc.set) throw new Error('setter is missing')

  const _set = desc.set

   // TODO: try {_set} finally {notify} ???
   desc.set = function(this: any, x: any) {
    _set.call(this, x)
    this.notify(key)
  }
}
