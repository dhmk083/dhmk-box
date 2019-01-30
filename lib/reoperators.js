import { Subject } from './re';
import { noop } from './utils';
export function pipe(...args) {
    const [src, ...tail] = args;
    return tail.reduce((acc, x) => x(acc), src);
}
export function compositeSubscription(...args) {
    return {
        unsubscribe: () => args.forEach(x => x.unsubscribe())
    };
}
export function filter(arg) {
    const pred = typeof arg === 'function' ?
        arg :
        (x) => x === arg;
    return obs => new Filter(pred, obs);
}
export function map(arg) {
    const map = typeof arg === 'function' ?
        arg :
        () => arg;
    return obs => new Map(map, obs);
}
export function filterMap(filter, map) {
    return obs => new FilterMap(map, filter, obs);
}
export function startWith(x) {
    return obs => new StartWith(x, obs);
}
export function take(n) {
    return obs => new Take(n, obs);
}
export function merge(...args) {
    return (obs) => new Merge(obs, ...args);
}
export function remerge(head, ...tail) {
    return merge(...tail)(head);
}
export function concat(...args) {
    return (obs) => new Concat(obs, ...args);
}
export function lazy(fn) {
    return {
        subscribe(...args) {
            return fn().subscribe(...args);
        }
    };
}
export function from(it) {
    return new IterableSubject(it);
}
export function of(...args) {
    return from(args);
}
class IterableSubject extends Subject {
    constructor(_it) {
        super();
        this._it = _it;
    }
    _onSubscription(s) {
        for (const x of this._it) {
            s.next(x);
        }
        s.complete();
    }
}
export class UnaryOperator extends Subject {
    subscribe(...args) {
        return compositeSubscription(super.subscribe(...args), this._src.subscribe(this));
    }
}
class Filter extends UnaryOperator {
    constructor(_pred, _src) {
        super();
        this._pred = _pred;
        this._src = _src;
    }
    next(x) {
        if (this._pred(x)) {
            super.next(x);
        }
    }
}
class Map extends UnaryOperator {
    constructor(_map, _src) {
        super();
        this._map = _map;
        this._src = _src;
    }
    next(x) {
        super.next(this._map(x));
    }
}
class FilterMap extends UnaryOperator {
    constructor(_map, _filter, _src) {
        super();
        this._map = _map;
        this._filter = _filter;
        this._src = _src;
    }
    next(x) {
        if (this._filter(x)) {
            super.next(this._map(x));
        }
    }
}
class StartWith extends UnaryOperator {
    constructor(_x, _src) {
        super();
        this._x = _x;
        this._src = _src;
    }
    _onSubscription(s) {
        s.next(this._x);
    }
}
class Take extends UnaryOperator {
    constructor(_n, _src) {
        super();
        this._n = _n;
        this._src = _src;
        if (_n <= 0) {
            super.complete();
        }
    }
    next(x) {
        super.next(x);
        if (--this._n <= 0) {
            super.complete();
        }
    }
}
class Merge extends Subject {
    constructor(_src, ...args) {
        super();
        this._src = _src;
        this._rest = args;
        this._active = this._rest.length + 1;
    }
    subscribe(...args) {
        return compositeSubscription(super.subscribe(...args), this._src.subscribe(this), ...this._rest.map(x => x.subscribe(this)));
    }
    complete() {
        if (--this._active === 0) {
            super.complete();
        }
    }
}
class Concat extends Subject {
    constructor(_src, ...args) {
        super();
        this._src = _src;
        this._current = { unsubscribe: noop };
        this._next = -1;
        this._rest = args;
    }
    subscribe(...args) {
        return compositeSubscription(super.subscribe(...args), this._src.subscribe(this), {
            unsubscribe: () => this._current.unsubscribe()
        });
    }
    complete() {
        if (++this._next === this._rest.length) {
            super.complete();
        }
        else {
            this._current = this._rest[this._next].subscribe(this);
        }
    }
}
// TODO:
//
// Split into separate files
//
// buffer
// combineLatest
// debounce/throttle
// delay
// from/to Promise
// flatMap
// scan
// switch
// takeUntil/takeWhile
// zip
