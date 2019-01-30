import { IObservable, ISubscription } from './types';
import { Subject } from './re';
declare type FMap<A, B> = (x: A) => B;
declare type FPred<T> = (x: T) => boolean;
export declare function pipe<T, A>(src: IObservable<T>, a: TOperator<T, A>): IObservable<A>;
export declare function pipe<T, A, B>(src: IObservable<T>, a: TOperator<T, A>, b: TOperator<A, B>): IObservable<B>;
export declare function pipe<T, A, B, C>(src: IObservable<T>, a: TOperator<T, A>, b: TOperator<A, B>, c: TOperator<B, C>): IObservable<C>;
export declare function pipe<T, A, B, C, D>(src: IObservable<T>, a: TOperator<T, A>, b: TOperator<A, B>, c: TOperator<B, C>, d: TOperator<C, D>): IObservable<D>;
export declare function pipe<T, A, B, C, D, E>(src: IObservable<T>, a: TOperator<T, A>, b: TOperator<A, B>, c: TOperator<B, C>, d: TOperator<C, D>, e: TOperator<D, E>): IObservable<E>;
export declare function pipe<T, A, B, C, D, E, F>(src: IObservable<T>, a: TOperator<T, A>, b: TOperator<A, B>, c: TOperator<B, C>, d: TOperator<C, D>, e: TOperator<D, E>, f: TOperator<E, F>): IObservable<F>;
export declare function pipe<T, A, B, C, D, E, F, G>(src: IObservable<T>, a: TOperator<T, A>, b: TOperator<A, B>, c: TOperator<B, C>, d: TOperator<C, D>, e: TOperator<D, E>, f: TOperator<E, F>, g: TOperator<F, G>): IObservable<G>;
export declare function pipe<T, A, B, C, D, E, F, G, H>(src: IObservable<T>, a: TOperator<T, A>, b: TOperator<A, B>, c: TOperator<B, C>, d: TOperator<C, D>, e: TOperator<D, E>, f: TOperator<E, F>, g: TOperator<F, G>, h: TOperator<G, H>): IObservable<H>;
export declare function compositeSubscription(...args: ISubscription[]): {
    unsubscribe: () => void;
};
export declare type TOperator<T, R> = FMap<IObservable<T>, IObservable<R>>;
export declare function filter<T>(fn: FPred<T>): TOperator<T, T>;
export declare function filter<T>(x: T): TOperator<T, T>;
export declare function map<T, R>(fn: FMap<T, R>): TOperator<T, R>;
export declare function map<T, R>(x: R): TOperator<T, R>;
export declare function filterMap<T, R>(filter: FPred<T>, map: FMap<T, R>): TOperator<T, R>;
export declare function startWith<T>(x: T): TOperator<T, T>;
export declare function take<T>(n: number): TOperator<T, T>;
export declare function merge<T, A>(a: IObservable<A>): TOperator<T, T | A>;
export declare function merge<T, A, B>(a: IObservable<A>, b: IObservable<B>): TOperator<T, T | A | B>;
export declare function merge<T, A, B, C>(a: IObservable<A>, b: IObservable<B>, c: IObservable<C>): TOperator<T, T | A | B | C>;
export declare function merge<T, A, B, C, D>(a: IObservable<A>, b: IObservable<B>, c: IObservable<C>, d: IObservable<D>): TOperator<T, T | A | B | C | D>;
export declare function merge<T>(...args: IObservable<T>[]): TOperator<T, T>;
export declare function remerge<A, B>(a: IObservable<A>, b: IObservable<B>): IObservable<A | B>;
export declare function remerge<A, B, C>(a: IObservable<A>, b: IObservable<B>, c: IObservable<C>): IObservable<A | B | C>;
export declare function remerge<A, B, C, D>(a: IObservable<A>, b: IObservable<B>, c: IObservable<C>, d: IObservable<D>): IObservable<A | B | C | D>;
export declare function remerge<T>(...args: IObservable<T>[]): IObservable<T>;
export declare function concat(...args: any[]): (obs: any) => Concat<{}>;
export declare function lazy<T>(fn: () => IObservable<T>): IObservable<T>;
export declare function from<T>(it: Iterable<T>): IObservable<T>;
export declare function of<T>(...args: T[]): IObservable<T>;
export declare abstract class UnaryOperator<T> extends Subject<T> {
    protected abstract readonly _src: IObservable<T>;
    subscribe(...args: any[]): {
        unsubscribe: () => void;
    };
}
declare class Concat<T> extends Subject<T> {
    private readonly _src;
    private readonly _rest;
    private _current;
    private _next;
    constructor(_src: IObservable<T>, ...args: any[]);
    subscribe(...args: any[]): {
        unsubscribe: () => void;
    };
    complete(): void;
}
export {};
