import { subj } from './core';
export function changeable(target) {
    const keys = Object.keys(target).filter(x => x !== 'changed');
    function Changeable() {
        this._$INST$ = target;
        this.changed = this._$INST$.changed || subj();
        this.notify = this.notify || this.changed.next.bind(this.changed);
    }
    Changeable.prototype = Object.create(Object.getPrototypeOf(target));
    Changeable.prototype.constructor = Changeable;
    for (const k of keys) {
        makePropNotifier(Changeable.prototype, k);
    }
    return new Changeable();
}
export class Changeable {
    constructor() {
        this.changed = subj();
    }
    notify(x) {
        this.changed.next(x);
    }
}
export function notify(proto, name, descriptor) {
    return (descriptor ?
        descriptor.value ?
            makeMethodNotifier(descriptor) :
            makeAccessorNotifier(name, descriptor)
        :
            makePropNotifier(proto, name));
}
function makeMethodNotifier(desc) {
    const fn = desc.value;
    desc.value = function () {
        let res;
        try {
            res = fn.apply(this, arguments);
        }
        finally {
            if (res && typeof res.then === 'function') {
                return res.then((x) => { this.notify(); return x; }, (e) => { this.notify(); throw e; });
            }
            else {
                this.notify();
                return res;
            }
        }
    };
}
function makePropNotifier(proto, key) {
    if (!proto._$GET_INST$) {
        proto._$GET_INST$ = function () {
            if (!this._$INST$)
                this._$INST$ = {};
            return this._$INST$;
        };
    }
    Object.defineProperty(proto, key, {
        get() { return this._$GET_INST$()[key]; },
        set(x) { this._$GET_INST$()[key] = x; this.notify(key); },
        enumerable: true
    });
}
function makeAccessorNotifier(key, desc) {
    if (!desc.set)
        throw new Error('setter is missing');
    const _set = desc.set;
    // TODO: try {_set} finally {notify} ???
    desc.set = function (x) {
        _set.call(this, x);
        this.notify(key);
    };
}
