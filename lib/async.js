import { cancellable } from './cancel';
import { core } from './core';
export function queue() {
    let head = Promise.resolve();
    return (fn) => {
        head = head.finally(fn);
        return head;
    };
}
export function chain() {
    const q = queue();
    let cancel = cancellable();
    return (fn) => {
        cancel.cancel();
        cancel = cancellable();
        return q(() => fn(cancel).catch(e => {
            if (!(e instanceof core.CancelledError)) {
                throw e;
            }
        }));
    };
}
