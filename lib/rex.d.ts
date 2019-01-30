import * as React from 'react';
import * as t from './types';
declare type ReactiveChildrenProps<T, P> = Readonly<P & {
    value: T | undefined;
}>;
declare type ReactiveProps<T, P extends {}> = P & {
    lock?: boolean;
    on?: t.IObservable<T>;
    children: (props: ReactiveChildrenProps<T, P>) => React.ReactNode;
};
export declare class Reactive<T = any, P extends {} = {}> extends React.Component<ReactiveProps<T, P>> {
    private _obs?;
    private _conn?;
    private value?;
    componentDidMount(): void;
    componentWillUnmount(): void;
    UNSAFE_componentWillReceiveProps(props: ReactiveProps<T, P>): void;
    shouldComponentUpdate(nextProps: ReactiveProps<T, P>): boolean;
    render(): React.ReactNode;
    private _updateSubscription;
}
declare type ReListLike<T> = {
    value: ReadonlyArray<T>;
    changed: t.IObservable<any>;
};
declare type ReListProps<T> = {
    source: (() => Iterable<T>) | Iterable<T> | ReListLike<T>;
    on?: t.IObservable<any>;
    children: (x: T, i: number) => React.ReactNode;
    itemOn?: (x: T, i: number) => t.IObservable<any>;
    empty?: React.ReactNode;
    keyGetter?: string | number | ((x: T) => string);
};
export declare class ReactiveList<T> extends React.Component<ReListProps<T>> {
    render(): JSX.Element;
}
export {};
