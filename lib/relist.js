import { Changeable } from './ch';
import { arrayReplace, arrayRemove } from './utils';
class ReListCore extends Changeable {
    constructor(value) {
        super();
        this.value = value;
    }
    get length() { return this.value.length; }
    set length(x) { this.value.length = x; this._update(); }
    get(index) {
        return this.value[index];
    }
    set(index, value) {
        this.value[index] = value;
        this._update();
        return this;
    }
    replace(arr) {
        arrayReplace(this.value, arr);
        this._update();
        return this;
    }
    remove(fn, count) {
        count = count === undefined ? this.value.length : count;
        arrayRemove(this.value, (x, i) => {
            if (!count)
                return false;
            if (fn(x, i)) {
                count--;
                return true;
            }
            else
                return false;
        });
        this._update();
        return this;
    }
    _update() {
        this.notify(this.value);
    }
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
// mutating - notify
;
[
    'copyWithin', 'fill', 'pop', 'push', 'reverse',
    'shift', 'sort', 'splice', 'unshift'
].forEach(k => {
    // @ts-ignore
    ReListCore.prototype[k] = function (...args) {
        // @ts-ignore
        const res = (this.value[k])(...args);
        this._update();
        return res;
    };
});
[
    'concat', 'entries', 'every', 'filter', 'find', 'findIndex',
    'forEach', 'includes', 'indexOf', 'join', 'keys', 'lastIndexOf',
    'map', 'reduce', 'reduceRight', 'slice', 'some', 'toLocaleString',
    'toString', 'values', Symbol.iterator
].forEach(k => {
    // @ts-ignore
    ReListCore.prototype[k] = function (...args) {
        // @ts-ignore
        return (this.value[k])(...args);
    };
});
export function relist(initial = []) {
    return new ReListCore(initial);
}
