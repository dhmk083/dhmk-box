import { descriptor } from './descriptor';
import { objectMap } from '../utils';
import { choices } from './validators';
// patch optional
function makeObjectInitial(descriptors) {
    return objectMap(descriptors, x => x.default());
}
export function castNumber(x) {
    return isNaN(x) ? x : Number(x);
}
function literal(...args) {
    // allows validator.meta.choices
    const validator = choices(args);
    return descriptor({
        type: 'literal',
        _default: args[0],
        validateImpl(x) {
            return validator(x);
        },
        validator,
    });
}
function union(...args) {
    return descriptor({
        type: 'union',
        _default: args[0].default(),
        meta: args,
        validateImpl(x, v) {
            for (const a of args) {
                if (!a.validate(x)) {
                    if (!v)
                        return;
                    if (!v(x))
                        return;
                }
            }
            return this.typeErrorMessage()(x, this);
        },
    });
}
function object(descriptors, _default) {
    return descriptor({
        type: 'object',
        _default: _default || makeObjectInitial(descriptors),
        meta: descriptors,
        validateImpl(x, v) {
            if (!x || typeof x !== 'object')
                return this.typeErrorMessage()(x, this);
            for (const k in x) {
                if (!(k in descriptors))
                    return this.typeErrorMessage()(x, this);
            }
            for (const k in descriptors) {
                const d = descriptors[k];
                if (!d)
                    return this.typeErrorMessage()(x, this);
                const e = d.validate(x[k]);
                if (e)
                    return this.typeErrorMessage()(x, this);
            }
            if (v)
                return v(x);
        },
    });
}
function array(d, _default = []) {
    return descriptor({
        type: 'array',
        _default: _default,
        meta: d,
        validateImpl(x, v) {
            if (!Array.isArray(x))
                return this.typeErrorMessage()(x, this);
            for (const item of x) {
                const e = d.validate(item);
                if (e)
                    return e;
            }
            if (v)
                return v(x);
        },
    });
}
function map(kd, vd, _default = new Map()) {
    return descriptor({
        type: 'map',
        _default: _default,
        meta: [kd, vd],
        validateImpl(x, v) {
            if (!(x instanceof Map))
                return this.typeErrorMessage()(x, this);
            for (const [k, v] of x) {
                const ke = kd.validate(k);
                if (ke)
                    return ke;
                const ve = vd.validate(v);
                if (ve)
                    return ve;
            }
            if (v)
                return v(x);
        },
        cast: x => {
            try {
                return new Map(x);
            }
            catch {
                return x;
            }
        }
    });
}
function _null() {
    return descriptor({
        type: 'null',
        _default: null,
        validateImpl(x) {
            if (x !== null)
                return this.typeErrorMessage()(x, this);
        },
    });
}
function opt(d) {
    return descriptor({
        type: 'optional',
        _default: d.default(),
        meta: d,
        validateImpl(x) {
            if (x === undefined)
                return;
            return d.validate(x);
        },
        cast: (x) => x === undefined ? x : d.cast(x),
        label: d.label(),
        description: d.description(),
    });
}
function number(_default = 0, validator) {
    return descriptor({
        type: 'number',
        _default,
        validator,
        validateImpl(x, v) {
            if (typeof x !== 'number')
                return this.typeErrorMessage()(x, this);
            if (v)
                return v(x);
        },
        cast: castNumber,
    });
}
function string(_default = '', validator) {
    return descriptor({
        type: 'string',
        _default,
        validator,
        validateImpl(x, v) {
            if (typeof x !== 'string')
                return this.typeErrorMessage()(x, this);
            if (v)
                return v(x);
        },
    });
}
function boolean(_default = false) {
    return descriptor({
        type: 'boolean',
        _default,
        validateImpl(x, v) {
            if (typeof x !== 'boolean')
                return this.typeErrorMessage()(x, this);
            if (v)
                return v(x);
        },
    });
}
export const d = {
    literal,
    union,
    object,
    array,
    map,
    opt,
    number,
    string,
    boolean,
    null: _null,
};
