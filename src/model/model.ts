import {Changeable, notify} from '../ch'
import {pipe, filter} from '../reoperators'
import {objectMap, arrayToObject} from '../utils'
import {KeyOf, DeepReadonly, IObservable} from '../types'

import {
  Descriptors, IModel, IFormField, ModelErrorsKeys,
  ModelValues, ModelErrors, ModelValidator,
  AsyncModelValidator, ValidationResult, IForm
} from './types'

// Always holds valid values.
// If initial values are invalid - throws in ctor.
// Notifies only when a valid value has been set
class Model<T> extends Changeable<KeyOf<T>> implements IModel<T> {
  private readonly _values: T

  get values() { return this._values as ModelValues<T> }

  constructor(
    readonly descriptors: Descriptors<T>,
    readonly validator?: ModelValidator<T>
  ) {
    super()

    this._values = objectMap<Descriptors<T>, KeyOf<T>, any>(descriptors, x => x.default()) as T

    //validate once and throw
    for (const k in descriptors) {
      const e = descriptors[k].validate(this._values[k])
      if (e) {
        throw new Error('Model has been supplied with invalid initial values: ' + e)
      }
    }
  }

  set(x: Partial<ModelValues<T>>, cast?: boolean) {
    const errors: Array<[string, ValidationResult]> = []

    for (const k in x) {
      const desc = this.descriptors[k as KeyOf<T>]
      const v = cast ? desc.cast()(x[k]) : x[k]
      const e = desc.validate(v)
      if (e) errors.push([k, e])
    }

    if (!errors.length && this.validator) {
      const moreErrors = this.validator(this._values as DeepReadonly<T>)

      for (const k in moreErrors) {
        if (k !== '_' && !(k in this.descriptors)) continue

        const e = moreErrors[k as KeyOf<T>]
        if (e) errors.push([k, e])
      }
    }

    if (!errors.length) {
      for (const k in x) {
        (this._values as any)[k] = x[k]
        this.notify(k as KeyOf<T>)
      }
    }

    return arrayToObject(errors) as ModelErrors<T>
  }
}

class FormModel<T> extends Changeable<ModelErrorsKeys<T>> implements IForm<T> {
  name = ''

  get hasErrors() { return !!this._errorsCount || !!this.errors._ }
  @notify isSubmitting = false

  readonly fields: any = {}
  readonly errors: any = {_: undefined}
  readonly _values: any = {}

  private _errorsCount = 0

  get values() {
    if (this.hasErrors) throw new Error('Form has errors.')
    return this._values
  }

  constructor(
    readonly descriptors: Descriptors<T>,
    readonly validator?: ModelValidator<T>,
  ) {
    super()

    for (const k in descriptors) {
      this.fields[k] = new FormField<T, KeyOf<T>>(
        this,
        k,
        () => this.notify(k as KeyOf<T>),
        pipe(this.changed, filter<any>(k))
      )
    }

    this.reset()
  }

  set(x: Partial<ModelValues<T>>, cast = true) {
    this._checkBusy()

    for (const k in x) {
      if (!(k in this.descriptors)) continue

      const desc = this.descriptors[k as KeyOf<T>]
      const v = x[k]
      this._setField(k as KeyOf<T>, cast ? desc.cast()(v) : v, false)
    }

    this._validateAll()
  }

  async submit(fn: AsyncModelValidator<T>) {
    this._checkBusy()

    const values = this.values
    this.isSubmitting = true

    try {
      const errors = await fn(values)
      this._setErrors(errors || {} as ModelErrors<T>)
    }
    finally {
      this.isSubmitting = false
    }
  }

  reset() {
    this._checkBusy()

    for (const k in this.descriptors) {
      const desc = this.descriptors[k]
      this._setField(k, desc.default(), false)
      this.fields[k].touched = false
    }

    this._validateAll()
  }

  setError(k: ModelErrorsKeys<T>, e: string) {
    this._checkBusy()
    this._setError(k, e)
  }

  setContext(k: KeyOf<T>, context: any) {
    this.fields[k].context = context
  }

  private _setError(k: ModelErrorsKeys<T>, e: ValidationResult) {
    const prevE = this.errors[k]
    this.errors[k] = e

    if (prevE && !e) {
      this._errorsCount--
    }

    if (!prevE && e) {
      this._errorsCount++
    }

    this.notify(k)
  }

  /*internal*/
  _setField(k: KeyOf<T>, v: any, validateAll = true) {
    const e = this.descriptors[k].validate(v)
    this._values[k] = v
    this._setError(k, e)

    if (validateAll) this._validateAll()
  }

  private _validateAll() {
    if (this.hasErrors || !this.validator) return

    const errors = this.validator(this.values)
    this._setErrors(errors || {} as ModelErrors<T>)
  }

  private _setErrors(errors: ModelErrors<T>) {
    for (const k in errors) {
      if (!(k in this.errors)) continue

      this._setError(k as ModelErrorsKeys<T>, errors[k as ModelErrorsKeys<T>])
    }
  }

  private _checkBusy() {
    if (this.isSubmitting) throw new Error('Form is busy.')
  }
}

/*internal*/
class FormField<T, K extends KeyOf<T>> implements IFormField<T[K]> {
  get descriptor() { return this.form.descriptors[this.key] }
  get name() { return this.form.name + '-' + this.key }
  get error() { return this.form.errors[this.key] }

  get raw() { return this.form._values[this.key] }
  set raw(x) {
    const v = this.descriptor.cast()(x)
    this.form._setField(this.key, v)
  }

  @notify touched = false
  @notify context = undefined

  constructor(
    private readonly form: FormModel<T>,
    private readonly key: K,
    // @ts-ignore
    private readonly notify: () => void,
    public readonly changed: IObservable<void>,
  ) {}
}

export function model<T>(
  descriptors: Descriptors<T>,
  modelValidator?: ModelValidator<T>,
) {
  return new Model<T>(descriptors, modelValidator)
}

export function form<T>(
  descriptors: Descriptors<T>,
  modelValidator?: ModelValidator<T>,
): IForm<T> {
  return new FormModel<T>(descriptors, modelValidator)
}
