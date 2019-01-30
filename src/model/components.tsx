import * as React from 'react'

// import {gid} from '../index'
// import {arrayRemove} from '../utils'
import {Reactive} from '../rex'
import {Select, Input, Checkbox} from '../input'
import {Bag} from '../types'
import {IForm, IDescriptor, IFormField, AsyncModelValidator} from './types'

const FormContext = React.createContext<IForm<any>>(undefined!)

type Props<T> = T & React.Props<any>

type FormProps<T> = Props<{src: IForm<T>, onSubmit: AsyncModelValidator<T>}>

export function Form<T>({src, onSubmit, children}: FormProps<T>) {
  return <FormContext.Provider value={src}>
    <form
      onSubmit={ev => { ev.preventDefault(); src.submit(onSubmit) }}
      onReset={ev => { ev.preventDefault(); src.reset()}}
    >
      {children}
    </form>
  </FormContext.Provider>
}

type ModelProps = Props<{src: IForm<any>}>

export function Model({src, children}: ModelProps) {
  return <FormContext.Provider value={src}>
    {children}
  </FormContext.Provider>
}

function checkNameSrc(name?: any, src?: any) {
  if (name && src) throw new Error('both `name` and `src` are specified')
  if (!name && !src) throw new Error('either `name` or `src` is required')
}

function renderDefaultField({field, Widget, widgetProps}: any) {
  return <div className='field'>
    <FieldLabel src={field} />
    <Widget {...widgetProps} />
    <FieldError src={field} />
  </div>
}

function renderField(field: IFormField<any>, children: any) {
  const get = () => field.raw
  const set = (x: any) => { field.raw = x; field.touched = true; }
  const onBlur = () => field.touched = true

  let render: any

  if (typeof children === 'function') {
    render = () => children({field, get, set, onBlur, FieldLabel, FieldError})
  }
  else {
    const widgetProps = {id: field.name, get, set, onBlur}

    const Widget = typeof children === 'function' ?
      undefined :
      pickWidget(field.descriptor)

    render = () => renderDefaultField({field, Widget, widgetProps})
  }

  return <Reactive on={field.changed}>
    {render}
  </Reactive>
}

export function WithField(props: {name: string, children: (field: IFormField<any>, form: IForm<any>) => React.ReactNode}): JSX.Element
export function WithField({name, children}: any) {
  return <FormContext.Consumer>
    {
      form => {
        if (!form) throw new Error('form context not found')

        const field = form.fields[name]
        if (!field) throw new Error(`field named "${name}" not found`)

        return children(field, form)
      }
    }
  </FormContext.Consumer>
}

export function Field(props: {name: string} & Bag): JSX.Element
export function Field<T>(props: {src: IFormField<T>} & Bag): JSX.Element
export function Field({name, src, children}: any) {
  checkNameSrc(name, src)

  if (src) {
    return renderField(src, children)
  }
  else {
    return <WithField name={name}>
      {
        field => renderField(field, children)
      }
    </WithField>
  }
}

function renderLabel(src: IFormField<any>) {
  const l = src.descriptor.label()()

  return <>
    {l && <label htmlFor={src.name}>{l}</label>}
  </>
}

export function FieldLabel(props: {name: string}): JSX.Element
export function FieldLabel(props: {src: IFormField<any>}): JSX.Element
export function FieldLabel({name, src}: any) {
  checkNameSrc(name, src)

  if (name) {
    return <WithField name={name}>
      {renderLabel}
    </WithField>
  }
  else return renderLabel(src)
}

function renderError(src: IFormField<any>) {
  return <Reactive on={src.changed}>
    {
      () => src.touched && src.error && <div className={`field-error ${src.name}`}>{src.error}</div> || null
    }
  </Reactive>
}

export function FieldError(props: {name: string}): JSX.Element
export function FieldError(props: {src: IFormField<any>}): JSX.Element
export function FieldError({name, src}: any) {
  checkNameSrc(name, src)

  if (name) {
    return <WithField name={name}>
      {renderError}
    </WithField>
  }
  else return renderError(src)
}

export function FormError() {
  return <FormContext.Consumer>
    {
      form => <Reactive on={form.changed}>
        {() => form.hasErrors && <div className={`form-error ${form.name}`}>{form.errors._}</div>}
      </Reactive>
    }
  </FormContext.Consumer>
}

export function Submit({children}: {
  children: ((form: IForm<any>) => JSX.Element) | React.ReactChild
}) {
  return <FormContext.Consumer>
    {
      form => <Reactive on={form.changed}>
        {
          () => <button type='submit' disabled={form.hasErrors}>
            {typeof children === 'function' ? children(form) : children}
          </button>
        }
      </Reactive>
    }
  </FormContext.Consumer>
}

function pickWidget(desc: IDescriptor<any>) {
  if (desc.type === 'optional') {
    desc = desc.meta as IDescriptor<any>
  }

  if (desc.type === 'number' || desc.type === 'string' || desc.type === 'literal') {
    const {meta} = (desc.validator() as any) || {} as any
    const choices = meta && meta.choices

    // min, max, required, etc... ?

    if (choices) {
      const items = () => choices

      return (props: any) => <Select items={items} {...props} />
    }
    else {
      return (props: any) => <Input {...props} />
    }
  }

  if (desc.type === 'boolean') {
    return (props: any) => <Checkbox {...props} />
  }

  if (desc.type === 'array') {
    // const subType = desc.meta
    // if subType in 'number', 'string', 'object': {value, name} or similar
    // return MultiSelect
  }

  throw new Error('unsupported descriptor type: ' + desc.type)
}

// export class ArrayField<T> extends React.Component {
//   _keys!: ReadonlyArray<string>
//   _lastVal?: ReadonlyArray<T>

//   render() {
//     const {get, set, field, children} = this.props

//     const ard = field.descriptor
//     const itd = ard.meta

//     const items = get()

//     if (this._lastVal !== items) {
//       this._keys = items.map(gid)
//     }

//     const add = () => {
//       this._keys = this._keys.concat(gid())
//       this._lastVal = items.concat(itd.default())
//       set(this._lastVal)
//     }

//     const remove = (n: number) => {
//       this._keys = this._keys.filter((_, i) => n !== i)
//       this._lastVal = items.filter((_, i) => n !== i)
//       set(this._lastVal)
//     }

//     const modify = (n: number, v) => {
//       this._lastVal = items.map((x, i) => n === i ? v : x)
//       set(this._lastVal)
//     }

//     const clear = () => {
//       this._lastVal = []
//       set(this._lastVal)
//     }

//     return children({items, keys: this._keys, add, remove, modify, clear})
//   }
// }
