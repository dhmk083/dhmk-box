function typeError(_, desc) {
    return `${desc.type} expected`;
}
function toFunc(x) {
    return typeof x === 'function' ? x : () => x;
}
function identity(x) { return x; }
export function descriptor(args) {
    const { meta, type, validateImpl, _default, validator, typeErrorMessage = typeError, cast = identity, label = toFunc(''), description = toFunc('') } = args;
    return {
        meta,
        type,
        validate(x) { return validateImpl.call(this, x, validator); },
        // TODO: optimize
        validator(x) { return arguments.length ? copyDescriptor(args, { validator: x }) : validator; },
        typeErrorMessage(x) { return arguments.length ? copyDescriptor(args, { typeErrorMessage: x }) : typeErrorMessage; },
        cast(x) { return arguments.length ? copyDescriptor(args, { cast: x }) : cast; },
        default(x) { return arguments.length ? copyDescriptor(args, { _default: x }) : _default; },
        label(x) { return arguments.length ? copyDescriptor(args, { label: toFunc(x) }) : label; },
        description(x) { return arguments.length ? copyDescriptor(args, { description: toFunc(x) }) : description; },
    };
}
function copyDescriptor(src, { meta, type, ...rest }) {
    return descriptor({
        ...src,
        ...rest
    });
}
