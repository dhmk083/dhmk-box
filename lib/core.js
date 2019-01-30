import { Subject, BehaviorSubject } from './re';
import { sid } from './utils';
class CancelledError extends Error {
    constructor() {
        super(...arguments);
        this.message = 'Operation has been cancelled';
    }
}
export const core = {
    Subject: Subject,
    BehaviorSubject: BehaviorSubject,
    CancelledError,
    gid: sid(),
};
export function subj(x) {
    return x !== undefined ?
        new core.BehaviorSubject(x) :
        new core.Subject();
}
export function gid() {
    return core.gid();
}
