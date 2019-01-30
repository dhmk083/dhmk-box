// DeepReadonly
// Based on https://github.com/Microsoft/TypeScript/issues/13923#issuecomment-402901005
//
type Primitive = undefined | null | boolean | string | number | Function

export type DeepReadonly<T> =
  T extends Primitive ? T :
  T extends Array<infer U> ? DeepReadonlyArray<U> :
  T extends ReadonlyArray<infer U> ? DeepReadonlyArray<U> :
  T extends Map<infer K, infer V> ? DeepReadonlyMap<K, V> :
  T extends ReadonlyMap<infer K, infer V> ? DeepReadonlyMap<K, V> :
  DeepReadonlyObject<T>

export interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}
export interface DeepReadonlyMap<K, V> extends ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>> {}
export type DeepReadonlyObject<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>
}
// DeepReadonly

// Observable
export interface ISubscription {
  unsubscribe(): void
}

export interface ISubscriber<T> {
  readonly next?: (x: T) => void
  readonly error?: (e: Error) => void
  readonly complete?: () => void
}

export type ISafeSubscriber<T> = Required<ISubscriber<T>>

export interface IObservable<T> {
  subscribe(s: ISubscriber<T>): ISubscription
  subscribe(
    onNext?: (x: T) => void,
    onError?: (e: Error) => void,
    onCompleted?: () => void
  ): ISubscription
}

export interface ISubject<T> extends IObservable<T> {
  next(x: T): void
  error(e: Error): void
  complete(): void
}
// Observable

// ReList
type ReListCore<T> = IChangeable<ReadonlyArray<T>> & {
  readonly value: ReadonlyArray<T>

  get(index: number): T
}

type ReadonlyArrayKeys<T> = Exclude<keyof ReadonlyArray<T>, number>
type ReadonlyArrayWithoutIndexer<T> = Pick<ReadonlyArray<T>, ReadonlyArrayKeys<T>> & Iterable<T>

type ArrayKeys<T> = Exclude<keyof Array<T>, number>
type ArrayWithoutIndexer<T> = Pick<Array<T>, ArrayKeys<T>> & Iterable<T>

export type ReadonlyReList<T> = ReListCore<T> & ReadonlyArrayWithoutIndexer<T>

export type ReList<T> = ReListCore<T> & ArrayWithoutIndexer<T> & {
  set(index: number, value: T): ReList<T>

  replace(arr: ReadonlyArray<T>): ReList<T>
  remove(fn: (x: T, i: number) => boolean, count?: number): ReList<T>
}
// ReList

// ReMap
type ReMapCore<K, V> = IChangeable<ReadonlyMap<K, V>> & {
  readonly value: ReadonlyMap<K, V>
}

export type ReadonlyReMap<K, V> = ReMapCore<K, V> & ReadonlyMap<K, V>

export type ReMap<K, V> = ReMapCore<K, V> & Map<K, V> & {
  replace(map: ReadonlyMap<K, V>): ReMap<K, V>
  remove(fn: (v: V, k: K) => boolean, count?: number): ReMap<K, V>
}
// ReMap

// Cancellation
export interface ICancel extends IChangeable {
  readonly cancelled: boolean

  throwIfCancelled(): void
}

export interface ICancellable {
  cancel(): void
}
// Cancellation

// Async
export type IAsyncQueue = <T>(fn: () => Promise<T>) => Promise<T>
export type IAsyncChain = <T>(fn: (c: ICancel) => Promise<T>) => Promise<T | void>
//

// Various
export interface IChangeable<T = void> {
  readonly changed: IObservable<T>
}

export type Bag = { [k: string]: any }
export type ReadonlyBag = Readonly<Bag>

export type GenericReturnType<F, T> = F extends Callable<T> ? T : never

export type Constructor<T = {}> = new (...args: any[]) => T

export type Callable<T> = {
  (...args: any[]): T
}

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

type Merge<A, B> = A & Pick<B, Exclude<keyof B, keyof A>>

export type Interface<I, Ctor> = Ctor extends new (...args: infer A) => I ? new (...args: A) => I : never
export type InterfaceMerged<I, T, Ctor> = Interface<Merge<I, T>, Ctor>

export type KeyOf<T> = Extract<keyof T, string>
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
// Various
