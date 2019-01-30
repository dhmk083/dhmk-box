import { ISafeSubscriber, ISubject } from './types';
declare function _noop(): void;
export declare class Subject<T> implements ISubject<T> {
    private readonly _listeners;
    private _isOver;
    isOver(): boolean | Error;
    subscribe(...args: any[]): {
        unsubscribe: typeof _noop;
    };
    next(x: T): void;
    error(e: Error): void;
    complete(): void;
    protected _onSubscription(_: ISafeSubscriber<T>): void;
    private _addListener;
    private _disposeListener;
    private _clean;
    private _finalize;
    private _makeSafeSubscriber;
}
export declare class BehaviorSubject<T> extends Subject<T> {
    private _value;
    constructor(_value: T);
    next(x: T): void;
    protected _onSubscription(s: ISafeSubscriber<T>): void;
}
export {};
