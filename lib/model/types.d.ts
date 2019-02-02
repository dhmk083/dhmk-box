import { KeyOf, DeepReadonly, IChangeable } from '../types';
declare type Cast<T> = <U>(x: U) => T | U;
export declare type ValidationResult = string | undefined;
export declare type Validator<T> = (x: DeepReadonly<T>) => ValidationResult;
declare type ValidateImpl<T> = (this: IDescriptor<T>, x: any, validator?: Validator<T>) => ValidationResult;
declare type FText = () => string;
declare type TextType = string | FText;
declare type TypeErrorFormatter<T> = (x: any, descriptor: IDescriptor<T>) => string;
export declare type DescriptorArgs<T> = Readonly<{
    meta?: Meta;
    type: string;
    validateImpl: ValidateImpl<T>;
    _default: DeepReadonly<T>;
    validator?: Validator<T>;
    typeErrorMessage?: TypeErrorFormatter<T>;
    cast?: Cast<T>;
    label?: FText;
    description?: FText;
}>;
export declare type Descriptors<T> = {
    readonly [K in keyof T]: IDescriptor<T[K]>;
};
declare type FormFieldMap<T> = Readonly<{
    [K in KeyOf<T>]: IFormField<T[K]>;
}>;
declare type ObjectDescriptor = Descriptors<any>;
declare type ArrayOrOptDescriptor = IDescriptor<any>;
declare type MapOrUnionDescriptor = ReadonlyArray<IDescriptor<any>>;
declare type Meta = ObjectDescriptor | ArrayOrOptDescriptor | MapOrUnionDescriptor | undefined;
export interface IDescriptor<T> {
    readonly meta: Meta;
    readonly type: string;
    validate(x: any): ValidationResult;
    validator(): Validator<T>;
    validator(x: Validator<T>): IDescriptor<T>;
    typeErrorMessage(): TypeErrorFormatter<T>;
    typeErrorMessage(x: TypeErrorFormatter<T>): IDescriptor<T>;
    cast(): Cast<T>;
    cast(x: Cast<T>): IDescriptor<T>;
    default(): DeepReadonly<T>;
    default(x: DeepReadonly<T>): IDescriptor<T>;
    label(): () => string;
    label(x: TextType): IDescriptor<T>;
    description(): () => string;
    description(x: TextType): IDescriptor<T>;
}
export interface IModel<T> extends IChangeable<KeyOf<T>> {
    readonly descriptors: Descriptors<T>;
    readonly validator?: ModelValidator<T>;
    readonly values: ModelValues<T>;
    set(x: Partial<ModelValues<T>>, cast?: boolean): ModelErrors<T>;
}
export interface IForm<T> extends IChangeable<ModelErrorsKeys<T>> {
    readonly descriptors: Descriptors<T>;
    readonly validator?: ModelValidator<T>;
    readonly values: ModelValues<T>;
    readonly fields: FormFieldMap<T>;
    readonly errors: ModelErrors<T>;
    readonly hasErrors: boolean;
    readonly isSubmitting: boolean;
    name: string;
    set(x: Partial<ModelValues<T>>, cast?: boolean): void;
    setError(k: ModelErrorsKeys<T>, e: string): void;
    setContext(k: KeyOf<T>, context: any): void;
    submit(fn: AsyncModelValidator<T>): Promise<void>;
    reset(): void;
}
export interface IFormField<T> extends IChangeable {
    readonly descriptor: IDescriptor<T>;
    readonly name: string;
    readonly error: ValidationResult;
    readonly context: any;
    raw: any;
    touched: boolean;
}
export declare type ModelErrorsKeys<T> = KeyOf<T> | '_';
export declare type ModelErrors<T> = Readonly<Partial<Record<ModelErrorsKeys<T>, ValidationResult>>>;
export declare type ModelValues<T> = DeepReadonly<T>;
export declare type ModelValidationResult<T> = ModelErrors<T> | undefined;
export declare type ModelValidator<T> = (values: ModelValues<T>) => ModelValidationResult<T>;
export declare type AsyncModelValidator<T> = (values: ModelValues<T>) => Promise<ModelValidationResult<T>>;
export {};
