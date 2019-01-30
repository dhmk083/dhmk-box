import { IDescriptor, Validator, Descriptors } from './types';
declare type Primitive = string | number | boolean | null | undefined;
declare type OptionalPropertyNames<T> = {
    [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];
declare type OptionalProperties<T> = Pick<T, OptionalPropertyNames<T>>;
declare type RequiredPropertyNames<T> = {
    [K in keyof T]: undefined extends T[K] ? never : K;
}[keyof T];
declare type RequiredProperties<T> = Pick<T, RequiredPropertyNames<T>>;
declare type PatchOptional<T extends {}> = RequiredProperties<T> & Partial<OptionalProperties<T>>;
export declare function castNumber(x: any): any;
declare function literal<T extends Primitive>(initial: T, ...rest: T[]): IDescriptor<T>;
declare function union<A, B>(a: IDescriptor<A>, b: IDescriptor<B>): IDescriptor<A | B>;
declare function union<A, B, C>(a: IDescriptor<A>, b: IDescriptor<B>, c: IDescriptor<C>): IDescriptor<A | B | C>;
declare function union<A, B, C, D>(a: IDescriptor<A>, b: IDescriptor<B>, c: IDescriptor<C>, d: IDescriptor<D>): IDescriptor<A | B | C | D>;
declare function union<A, B, C, D, E>(a: IDescriptor<A>, b: IDescriptor<B>, c: IDescriptor<C>, d: IDescriptor<D>, e: IDescriptor<E>): IDescriptor<A | B | C | D | E>;
declare function union<A, B, C, D, E, F>(a: IDescriptor<A>, b: IDescriptor<B>, c: IDescriptor<C>, d: IDescriptor<D>, e: IDescriptor<E>, f: IDescriptor<F>): IDescriptor<A | B | C | D | E | F>;
declare function object<T extends {}>(descriptors: Descriptors<T>, _default?: T): IDescriptor<PatchOptional<T>>;
declare function array<T>(d: IDescriptor<T>, _default?: ReadonlyArray<T>): IDescriptor<ReadonlyArray<T>>;
declare function map<K, V>(kd: IDescriptor<K>, vd: IDescriptor<V>, _default?: ReadonlyMap<K, V>): IDescriptor<ReadonlyMap<K, V>>;
declare function _null(): IDescriptor<null>;
declare function opt<T>(d: IDescriptor<T>): IDescriptor<T | undefined>;
declare function number(_default?: number, validator?: Validator<number>): IDescriptor<number>;
declare function string(_default?: string, validator?: Validator<string>): IDescriptor<string>;
declare function boolean(_default?: boolean): IDescriptor<boolean>;
export declare const d: {
    literal: typeof literal;
    union: typeof union;
    object: typeof object;
    array: typeof array;
    map: typeof map;
    opt: typeof opt;
    number: typeof number;
    string: typeof string;
    boolean: typeof boolean;
    null: typeof _null;
};
export {};
