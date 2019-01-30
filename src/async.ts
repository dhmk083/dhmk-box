import {IAsyncQueue, IAsyncChain} from './types'
import {cancellable, ICancel} from './cancel'
import {core} from './core'

export function queue(): IAsyncQueue {
  let head = Promise.resolve()

  return <T>(fn: () => Promise<T>): Promise<T> => {
    head = head.finally(fn)
    return head as any
  }
}

export function chain(): IAsyncChain {
  const q = queue()
  let cancel = cancellable()

  return <T>(fn: (c: ICancel) => Promise<T>): Promise<T | void> => {
    cancel.cancel()
    cancel = cancellable()

    return q(() => fn(cancel).catch(e => {
      if (!(e instanceof core.CancelledError)) {
        throw e
      }
    })) as any
  }
}
