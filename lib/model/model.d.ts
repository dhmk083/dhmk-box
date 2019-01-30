import { Changeable } from '../ch';
import { KeyOf, DeepReadonly } from '../types';
import { Descriptors, IModel, ModelErrorsKeys, ModelValues, ModelValidator, IForm } from './types';
declare class Model<T> extends Changeable<KeyOf<T>> implements IModel<T> {
    readonly descriptors: Descriptors<T>;
    readonly validator?: ModelValidator<T> | undefined;
    private readonly _values;
    readonly values: DeepReadonly<T>;
    constructor(descriptors: Descriptors<T>, validator?: ModelValidator<T> | undefined);
    set(x: Partial<ModelValues<T>>, cast?: boolean): Readonly<Partial<Record<ModelErrorsKeys<T>, string | undefined>>>;
}
export declare function model<T>(descriptors: Descriptors<T>, modelValidator?: ModelValidator<T>): Model<T>;
export declare function form<T>(descriptors: Descriptors<T>, modelValidator?: ModelValidator<T>): IForm<T>;
export {};
