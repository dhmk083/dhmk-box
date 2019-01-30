import {ISubject} from './types'
import {Subject, BehaviorSubject} from './re'
import {sid} from './utils'

class CancelledError extends Error {
  message = 'Operation has been cancelled'
}

export const core = {
  Subject: Subject as new <T>() => ISubject<T>,
  BehaviorSubject: BehaviorSubject as new <T>(initial: T) => ISubject<T>,
  CancelledError,
  gid: sid(),
}

export function subj<T = void>(x?: T): ISubject<T> {
  return x !== undefined ?
    new core.BehaviorSubject<T>(x) :
    new core.Subject<T>()
}

export function gid() {
  return core.gid()
}