import { lazy, of } from './reoperators';
import { subj, core } from './core';
export function cancellable() {
    const s = subj();
    let cancelled = false;
    return {
        changed: lazy(() => cancelled ?
            of(undefined) :
            s),
        get cancelled() { return cancelled; },
        cancel() { cancelled = true; s.next(undefined); s.complete(); },
        throwIfCancelled() {
            if (cancelled) {
                throw new core.CancelledError();
            }
        }
    };
}
