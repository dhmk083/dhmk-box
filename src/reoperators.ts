import {IObservable, ISafeSubscriber, ISubscription} from './types'
import {Subject} from './re'
import {noop} from './utils'

type FMap<A, B> = (x: A) => B
type FPred<T> = (x: T) => boolean

export function pipe<T, A>(src: IObservable<T>, a: TOperator<T, A>): IObservable<A>
export function pipe<T, A, B>(src: IObservable<T>, a: TOperator<T, A>, b: TOperator<A, B>): IObservable<B>
export function pipe<T, A, B, C>(src: IObservable<T>, a: TOperator<T, A>, b: TOperator<A, B>, c: TOperator<B, C>): IObservable<C>
export function pipe<T, A, B, C, D>(src: IObservable<T>, a: TOperator<T, A>, b: TOperator<A, B>, c: TOperator<B, C>, d: TOperator<C, D>): IObservable<D>
export function pipe<T, A, B, C, D, E>(src: IObservable<T>, a: TOperator<T, A>, b: TOperator<A, B>, c: TOperator<B, C>, d: TOperator<C, D>, e: TOperator<D, E>): IObservable<E>
export function pipe<T, A, B, C, D, E, F>(src: IObservable<T>, a: TOperator<T, A>, b: TOperator<A, B>, c: TOperator<B, C>, d: TOperator<C, D>, e: TOperator<D, E>, f: TOperator<E, F>): IObservable<F>
export function pipe<T, A, B, C, D, E, F, G>(src: IObservable<T>, a: TOperator<T, A>, b: TOperator<A, B>, c: TOperator<B, C>, d: TOperator<C, D>, e: TOperator<D, E>, f: TOperator<E, F>, g: TOperator<F, G>): IObservable<G>
export function pipe<T, A, B, C, D, E, F, G, H>(src: IObservable<T>, a: TOperator<T, A>, b: TOperator<A, B>, c: TOperator<B, C>, d: TOperator<C, D>, e: TOperator<D, E>, f: TOperator<E, F>, g: TOperator<F, G>, h: TOperator<G, H>): IObservable<H>
export function pipe(...args: any[]) {
  const [src, ...tail] = args
  return tail.reduce((acc, x) => x(acc), src)
}

export function compositeSubscription(...args: ISubscription[]) {
  return {
    unsubscribe: () => args.forEach(x => x.unsubscribe())
  }
}

export type TOperator<T, R> = FMap<IObservable<T>, IObservable<R>>

export function filter<T>(fn: FPred<T>): TOperator<T, T>
export function filter<T>(x: T): TOperator<T, T>
export function filter<T>(arg: any): TOperator<T, T> {
  const pred = typeof arg === 'function' ?
    arg :
    (x: any) => x === arg

  return obs => new Filter<T>(pred, obs)
}

export function map<T, R>(fn: FMap<T, R>): TOperator<T, R>
export function map<T, R>(x: R): TOperator<T, R>
export function map<T, R>(arg: any): TOperator<T, R> {
  const map = typeof arg === 'function' ?
    arg :
    () => arg

  return obs => new Map<T, R>(map, obs)
}

export function filterMap<T, R>(filter: FPred<T>, map: FMap<T, R>): TOperator<T, R> {
  return obs => new FilterMap<T, R>(map, filter, obs)
}

export function startWith<T>(x: T): TOperator<T, T> {
  return obs => new StartWith<T>(x, obs)
}

export function take<T>(n: number): TOperator<T, T> {
  return obs => new Take<T>(n, obs)
}

export function merge<T, A>(a: IObservable<A>): TOperator<T, T | A>
export function merge<T, A, B>(a: IObservable<A>, b: IObservable<B>): TOperator<T, T | A | B>
export function merge<T, A, B, C>(a: IObservable<A>, b: IObservable<B>, c: IObservable<C>): TOperator<T, T | A | B | C>
export function merge<T, A, B, C, D>(a: IObservable<A>, b: IObservable<B>, c: IObservable<C>, d: IObservable<D>): TOperator<T, T | A | B | C | D>
export function merge<T>(...args: IObservable<T>[]): TOperator<T, T>
export function merge(...args: any[]) {
  return (obs: any) => new Merge(obs, ...args)
}

export function remerge<A, B>(a: IObservable<A>, b: IObservable<B>): IObservable<A | B>
export function remerge<A, B, C>(a: IObservable<A>, b: IObservable<B>, c: IObservable<C>): IObservable<A | B | C>
export function remerge<A, B, C, D>(a: IObservable<A>, b: IObservable<B>, c: IObservable<C>, d: IObservable<D>): IObservable<A | B | C | D>
export function remerge<T>(...args: IObservable<T>[]): IObservable<T>
export function remerge(head: any, ...tail: any[]) {
  return merge(...tail)(head)
}

export function concat(...args: any[]) {
  return (obs: any) => new Concat(obs, ...args)
}

export function lazy<T>(fn: () => IObservable<T>): IObservable<T> {
  return {
    subscribe(...args: any[]) {
      return fn().subscribe(...args)
    }
  }
}

export function from<T>(it: Iterable<T>): IObservable<T> {
  return new IterableSubject<T>(it)
}

export function of<T>(...args: T[]): IObservable<T> {
  return from(args)
}

class IterableSubject<T> extends Subject<T> {
  constructor(
    private _it: Iterable<T>
  ) {super()}

  protected _onSubscription(s: ISafeSubscriber<T>) {
    for (const x of this._it) {
      s.next(x)
    }
    s.complete()
  }
}

export abstract class UnaryOperator<T> extends Subject<T> {
  protected abstract readonly _src: IObservable<T>

  subscribe(...args: any[]) {
    return compositeSubscription(
      super.subscribe(...args),
      this._src.subscribe(this)
    )
  }
}

class Filter<T> extends UnaryOperator<T> {
  constructor(
    private readonly _pred: FPred<T>,
    protected readonly _src: IObservable<T>
  ) {super()}

  next(x: T) {
    if (this._pred(x)) {
      super.next(x)
    }
  }
}

class Map<T, R> extends UnaryOperator<any> {
  constructor(
    private readonly _map: FMap<T, R>,
    protected readonly _src: IObservable<T>
  ) {super()}

  next(x: any) {
    super.next(this._map(x))
  }
}

class FilterMap<T, R> extends UnaryOperator<any> {
  constructor(
    private readonly _map: FMap<T, R>,
    private readonly _filter: FPred<T>,
    protected readonly _src: IObservable<T>
  ) {super()}

  next(x: any) {
    if (this._filter(x)) {
      super.next(this._map(x))
    }
  }
}

class StartWith<T> extends UnaryOperator<T> {
  constructor(
    private readonly _x: T,
    protected readonly _src: IObservable<T>
  ) {super()}

  protected _onSubscription(s: ISafeSubscriber<T>) {
    s.next(this._x)
  }
}

class Take<T> extends UnaryOperator<T> {
  constructor(
    private _n: number,
    protected readonly _src: IObservable<T>
  ) {
    super()

    if (_n <= 0) {
      super.complete()
    }
  }

  next(x: T) {
    super.next(x)

    if (--this._n <= 0) {
      super.complete()
    }
  }
}

class Merge<T> extends Subject<T> {
  private readonly _rest: ReadonlyArray<IObservable<T>>
  private _active: number

  constructor(
    private readonly _src: IObservable<T>,
    ...args: any[]
  ) {
    super()
    this._rest = args
    this._active = this._rest.length + 1
  }

  subscribe(...args: any[]) {
    return compositeSubscription(
      super.subscribe(...args),
      this._src.subscribe(this),
      ...this._rest.map(x => x.subscribe(this))
    )
  }

  complete() {
    if (--this._active === 0) {
      super.complete()
    }
  }
}

class Concat<T> extends Subject<T> {
  private readonly _rest: ReadonlyArray<IObservable<T>>
  private _current = {unsubscribe: noop}
  private _next = -1

  constructor(
    private readonly _src: IObservable<T>,
    ...args: any[]
  ) {
    super()
    this._rest = args
  }

  subscribe(...args: any[]) {
    return compositeSubscription(
      super.subscribe(...args),
      this._src.subscribe(this),
      {
        unsubscribe: () => this._current.unsubscribe()
      }
    )
  }

  complete() {
    if (++this._next === this._rest.length) {
      super.complete()
    }
    else {
      this._current = this._rest[this._next].subscribe(this)
    }
  }
}

// TODO:
//
// Split into separate files
//
// buffer
// combineLatest
// debounce/throttle
// delay
// from/to Promise
// flatMap
// scan
// switch
// takeUntil/takeWhile
// zip
