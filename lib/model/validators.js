function hasMeta(f) {
    return typeof f.meta === 'object';
}
export function combine(...args) {
    const validator = (x) => {
        for (const f of args) {
            const r = f(x);
            if (r)
                return r;
        }
    };
    for (const f of args) {
        if (!hasMeta(f))
            return;
        validator.meta = {
            ...validator.meta,
            ...f.meta,
        };
    }
    return validator;
}
export function choices(a) {
    if (!a.length)
        throw new Error('Empty choices are not allowed.');
    function v(x) { if (!a.includes(x))
        return `Value must be one of the following: ${a}.`; }
    v.meta = {
        choices: a
    };
    return v;
}
export function range(min, max, errorMessage) {
    function v(x) { if (x < min || x > max)
        return (errorMessage || range.errorMessage)(x, min, max); }
    v.meta = {
        min,
        max
    };
    return v;
}
range.errorMessage = ((_, min, max) => `Value must be in range [${min}, ${max}].`);
export function required(msg) {
    function v(x) { if (!x)
        return msg || 'Value is required.'; }
    v.meta = {
        required: true
    };
    return v;
}
export function eq(val) {
    function v(x) { if (x !== val)
        return `Value must be equal to ${val}.`; }
    v.meta = {
        eq: val
    };
    return v;
}
