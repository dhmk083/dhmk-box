import { ISubject } from './types';
declare class CancelledError extends Error {
    message: string;
}
export declare const core: {
    Subject: new <T>() => ISubject<T>;
    BehaviorSubject: new <T>(initial: T) => ISubject<T>;
    CancelledError: typeof CancelledError;
    gid: () => string;
};
export declare function subj<T = void>(x?: T): ISubject<T>;
export declare function gid(): string;
export {};
