import { IChangeable, IObservable, Omit } from './types';
declare type TKeys<T> = Exclude<keyof T, 'changed'>;
declare type StripChanged<T> = T extends {
    changed: any;
} ? Omit<T, 'changed'> : T;
declare type TChangeable<T, U> = StripChanged<T> & IChangeable<U>;
export declare function changeable<T extends {}>(target: StripChanged<T>): TChangeable<T, TKeys<T>>;
export declare function changeable<T extends {}, U>(target: StripChanged<T>): TChangeable<T, U>;
export declare class Changeable<T = void> implements IChangeable<T> {
    readonly changed: IObservable<T>;
    protected notify(x: T): void;
}
export declare function notify(proto: any, name: string, descriptor?: PropertyDescriptor): void;
export {};
