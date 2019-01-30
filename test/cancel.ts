import {assert} from 'chai'
import {fake} from 'sinon'

import {cancellable} from '../src/cancel'

describe('cancellable', () => {
  it('notifies when gets cancelled', () => {
    const token = cancellable()
    const a = fake()
    const b = fake()

    token.changed.subscribe(a)
    token.changed.subscribe(b)

    token.cancel()

    assert(a.called)
    assert(b.called)

    token.cancel()

    assert(a.calledOnce)
    assert(b.calledOnce)
  })

  it('immediately notifies if is already cancelled', () => {
    const token = cancellable()
    const a = fake()

    token.cancel()

    token.changed.subscribe(a)

    assert(a.called)
  })
})
