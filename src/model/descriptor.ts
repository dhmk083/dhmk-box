import {IDescriptor, DescriptorArgs} from './types'

function typeError(_: any, desc: IDescriptor<any>) {
  return `${desc.type} expected`
}

function toFunc<T>(x: T | (() => T)) {
  return typeof x === 'function' ? x as (() => T) : () => x
}

function identity<T>(x: T) { return x }

export function descriptor<T>(args: DescriptorArgs<T>): IDescriptor<T> {
  const {
    meta,
    type,
    validateImpl,

    _default,
    validator,
    typeErrorMessage = typeError,
    cast = identity,
    label = toFunc(''),
    description = toFunc('')
  } = args

  return {
    meta,
    type,

    validate(x: any) { return validateImpl.call(this, x, validator) },

    // TODO: optimize

    validator(x?: any): any { return arguments.length ? copyDescriptor(args, {validator: x}) : validator },
    typeErrorMessage(x?: any): any { return arguments.length ? copyDescriptor(args, {typeErrorMessage: x}) : typeErrorMessage },
    cast(x?: any): any { return arguments.length ? copyDescriptor(args, {cast: x}) : cast },
    default(x?: any): any { return arguments.length ? copyDescriptor(args, {_default: x}) : _default },
    label(x?: any): any { return arguments.length ? copyDescriptor(args, {label: toFunc(x)}) : label },
    description(x?: any): any { return arguments.length ? copyDescriptor(args, {description: toFunc(x)}) : description },
  }
}

function copyDescriptor<T>(src: DescriptorArgs<T>, {meta, type, ...rest}: Partial<DescriptorArgs<T>>) {
  return descriptor({
    ...src,
    ...rest
  })
}
