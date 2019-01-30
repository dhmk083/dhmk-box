export function identity(x) { return x; }
export function noop() { }
// array
export function arrayReplace(a, b) {
    const len = a.length = b.length;
    for (let i = 0; i < len; ++i) {
        a[i] = b[i];
    }
}
export function arrayRemove(a, fn) {
    const len = a.length;
    for (let i = 0; i < len; ++i) {
        if (fn(a[i], i)) {
            a.splice(i, 1);
            i--;
        }
    }
}
export function arrayToObject(arr) {
    const r = {};
    for (const [k, v] of arr) {
        r[k] = v;
    }
    return r;
}
// array
// object
export function objectMap(obj, fn) {
    const r = {};
    for (const k in obj) {
        r[k] = fn(obj[k], k);
    }
    return r;
}
// object
export function sid() {
    let i = 0;
    return () => {
        if (!Number.isSafeInteger(i++))
            throw new RangeError('sid depleted');
        return i.toString();
    };
}
export function keyGetter(k) {
    if (typeof k === 'function')
        return k;
    if (k)
        return (x) => x[k].toString();
    return (x) => (x.key || x.id || '').toString();
}
