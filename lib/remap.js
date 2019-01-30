import { Changeable } from './ch';
class ReMapCore extends Changeable {
    constructor(value) {
        super();
        this.value = value;
    }
    get size() { return this.value.size; }
    replace(map) {
        this.value.clear();
        for (const [k, v] of map) {
            this.value.set(k, v);
        }
        this._update();
        return this;
    }
    remove(fn, count) {
        count = count === undefined ? this.value.size : count;
        for (const [k, v] of this.value) {
            if (!count)
                break;
            if (fn(v, k)) {
                this.value.delete(k);
                count--;
            }
        }
        this._update();
        return this;
    }
    _update() {
        this.notify(this.value);
    }
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// mutating - notify
;
[
    'clear', 'delete', 'set'
].forEach(k => {
    // @ts-ignore
    ReMapCore.prototype[k] = function (...args) {
        // @ts-ignore
        const res = (this.value[k])(...args);
        this._update();
        return res;
    };
});
[
    'entries', 'forEach', 'get', 'has', 'keys', 'values',
    'toLocaleString', 'toString', 'values', Symbol.iterator
].forEach(k => {
    // @ts-ignore
    ReMapCore.prototype[k] = function (...args) {
        // @ts-ignore
        return (this.value[k])(...args);
    };
});
export function remap(initial = new Map()) {
    return new ReMapCore(initial);
}
