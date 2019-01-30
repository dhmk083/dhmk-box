import {ISafeSubscriber, ISubject} from './types'
import {arrayReplace} from './utils'

function _noop() {} // for comparing in Subject.error()

function throwAsync(e: Error) {
  setTimeout(() => { throw e }, 0)
}

export class Subject<T> implements ISubject<T> {
  private readonly _listeners: Array<ISafeSubscriber<T> | undefined> = []
  private _isOver: boolean | Error = false

  isOver() {
    return this._isOver
  }

  subscribe(...args: any[]) {
    const safeSubscriber = this._makeSafeSubscriber(...args)

    if (this._isOver) {
      if (this._isOver === true) {
        // not using this.complete() here
        safeSubscriber.complete()
      }
      else {
        // not using this.error() here
        safeSubscriber.error(this._isOver)
      }

      return {
        unsubscribe: _noop
      }
    }
    else {
      this._addListener(safeSubscriber)
      this._onSubscription(safeSubscriber)

      return {
        unsubscribe: () => this._disposeListener(safeSubscriber)
      }
    }
  }

  next(x: T) {
    let err: Error | undefined
    let needClean = false
    const len = this._listeners.length

    for (let i = 0; i < len; ++i) {
      const l = this._listeners[i]
      if (l) {
        try {
          l.next(x)
        }
        catch(e) {
          err = e
          this._disposeListener(l)
          needClean = true
          break
        }
      }
      else {
        needClean = true
      }
    }

    if (needClean) {
      this._clean()
    }

    if (err) {
      throwAsync(err)
    }
  }

  error(e: Error) {
    this._finalize(e)

    const errors = []
    let handled = true

    while (this._listeners.length) {
      const l = this._listeners.shift()
      this._disposeListener(l)
      if (!l) continue

      try {
        l.error(e)
        if (l.error === _noop) {
          handled = false
        }
      }
      catch(_e) {
        errors.push(e)
      }
    }

    if (!handled) {
      throwAsync(e)
    }

    if (errors.length) {
      for (const e of errors) {
        throwAsync(e)
      }
    }
  }

  complete() {
    this._finalize(true)

    const errors = []

    while (this._listeners.length) {
      const l = this._listeners.shift()
      this._disposeListener(l)
      if (!l) continue

      try {
        l.complete()
      }
      catch(e) {
        errors.push(e)
      }
    }

    if (errors.length) {
      for (const e of errors) {
        throwAsync(e)
      }
    }
  }

  // virtual
  protected _onSubscription(_: ISafeSubscriber<T>) {}

  private _addListener(s: ISafeSubscriber<T>) {
    if (this._listeners.indexOf(s) === -1) {
      this._listeners.push(s)
    }
  }

  private _disposeListener(s: ISafeSubscriber<T> | undefined) {
    const index = this._listeners.indexOf(s)

    if (index !== -1) {
      this._listeners[index] = undefined
    }
  }

  private _clean() {
    arrayReplace(this._listeners, this._listeners.filter(x => x))
  }

  private _finalize(isOver: boolean | Error) {
    this._isOver = isOver

    this.next = _noop
    this.error = _noop
    this.complete = _noop
  }

  private _makeSafeSubscriber(...args: any[]): ISafeSubscriber<T> {
    const s = typeof args[0] === 'object' ?
      args[0] :
      {next: args[0], error: args[1], complete: args[2]}

    return {
      next: s.next ? s.next.bind(s) : _noop,
      error: s.error ? s.error.bind(s) : _noop,
      complete: s.complete ? s.complete.bind(s) : _noop,
    }
  }
}

export class BehaviorSubject<T> extends Subject<T> {
  constructor(
    private _value: T
  ) {super()}

  next(x: T) {
    this._value = x
    super.next(x)
  }

  protected _onSubscription(s: ISafeSubscriber<T>) {
    s.next(this._value)
  }
}
