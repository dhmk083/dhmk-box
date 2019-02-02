import {KeyOf, DeepReadonly, IChangeable} from '../types'

type Cast<T> = <U>(x: U) => T | U

// TODO: and maybe (x: someContext) => string
// to improve error message formatting
export type ValidationResult = string | undefined
export type Validator<T> = (x: DeepReadonly<T>) => ValidationResult

type ValidateImpl<T> = (this: IDescriptor<T>, x: any, validator?: Validator<T>) => ValidationResult

type FText = () => string
type TextType = string | FText
type TypeErrorFormatter<T> = (x: any, descriptor: IDescriptor<T>) => string

export type DescriptorArgs<T> = Readonly<{
  meta?: Meta
  type: string
  validateImpl: ValidateImpl<T>

  _default: DeepReadonly<T>
  validator?: Validator<T>
  typeErrorMessage?: TypeErrorFormatter<T>
  cast?: Cast<T>
  label?: FText
  description?: FText
}>

export type Descriptors<T> = {
  readonly [K in keyof T]: IDescriptor<T[K]>
}

type FormFieldMap<T> = Readonly<{
  [K in KeyOf<T>]: IFormField<T[K]>
}>

type ObjectDescriptor = Descriptors<any>
type ArrayOrOptDescriptor = IDescriptor<any>
type MapOrUnionDescriptor = ReadonlyArray<IDescriptor<any>>

type Meta = ObjectDescriptor | ArrayOrOptDescriptor | MapOrUnionDescriptor | undefined

export interface IDescriptor<T> {
  readonly meta: Meta
  readonly type: string

  // validate type + custom
  validate(x: any): ValidationResult

  // custom validation for T
  validator(): Validator<T>
  validator(x: Validator<T>): IDescriptor<T>

  typeErrorMessage(): TypeErrorFormatter<T>
  typeErrorMessage(x: TypeErrorFormatter<T>): IDescriptor<T>

  cast(): Cast<T>
  cast(x: Cast<T>): IDescriptor<T>

  default(): DeepReadonly<T>
  default(x: DeepReadonly<T>): IDescriptor<T>

  label(): () => string
  label(x: TextType): IDescriptor<T>

  description(): () => string
  description(x: TextType): IDescriptor<T>
}

export interface IModel<T> extends IChangeable<KeyOf<T>> {
  readonly descriptors: Descriptors<T>
  readonly validator?: ModelValidator<T>
  readonly values: ModelValues<T>

  set(x: Partial<ModelValues<T>>, cast?: boolean): ModelErrors<T>
}

export interface IForm<T> extends IChangeable<ModelErrorsKeys<T>> {
  readonly descriptors: Descriptors<T>
  readonly validator?: ModelValidator<T>
  readonly values: ModelValues<T>
  readonly fields: FormFieldMap<T>
  readonly errors: ModelErrors<T>
  readonly hasErrors: boolean
  readonly isSubmitting: boolean

  name: string // just for convenience

  set(x: Partial<ModelValues<T>>, cast?: boolean): void
  setError(k: ModelErrorsKeys<T>, e: string): void
  setContext(k: KeyOf<T>, context: any): void

  submit(fn: AsyncModelValidator<T>): Promise<void>
  reset(): void
}

export interface IFormField<T> extends IChangeable {
  readonly descriptor: IDescriptor<T>
  readonly name: string
  readonly error: ValidationResult
  readonly context: any

  raw: any
  touched: boolean
}

export type ModelErrorsKeys<T> = KeyOf<T> | '_'
export type ModelErrors<T> = Readonly<Partial<Record<ModelErrorsKeys<T>, ValidationResult>>>
export type ModelValues<T> = DeepReadonly<T> //TODO + .changed ?

export type ModelValidationResult<T> = ModelErrors<T> | undefined
export type ModelValidator<T> = (values: ModelValues<T>) => ModelValidationResult<T>
export type AsyncModelValidator<T> = (values: ModelValues<T>) => Promise<ModelValidationResult<T>>
