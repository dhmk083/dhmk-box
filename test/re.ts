import {assert} from 'chai'
import {fake, useFakeTimers} from 'sinon'

import {Subject} from '../src/re'

describe('Subject', () => {
  describe('.subscribe', () => {
    it('calls subscribers` .next(x) function', () => {
      const s = new Subject()
      const a = fake()
      const b = fake()

      s.subscribe(a)
      s.subscribe(b)

      s.next(11)

      assert(a.calledOnceWith(11))
      assert(b.calledOnceWith(11))
    })

    it('removes all subscribers after .complete()', () => {
      const s = new Subject()
      const a = fake()
      const b = fake()

      s.subscribe(a)
      s.subscribe(b)

      s.next(11)
      s.complete()
      s.next(22)
      s.next(33)

      assert(a.calledOnceWith(11))
      assert(b.calledOnceWith(11))
    })

    it('removes all subscribers after .error()', () => {
      const s = new Subject()
      const a = fake()
      const b = fake()
      const catcher = fake()
      const err = new Error()

      s.subscribe(a, catcher)
      s.subscribe(b, catcher)

      s.next(11)
      s.error(err)
      s.next(22)
      s.next(33)

      assert(a.calledOnceWith(11))
      assert(b.calledOnceWith(11))

      assert(catcher.calledTwice)
      assert(catcher.calledWith(err))
    })

    it('removes subscriber (and only it) that throws', () => {
      const s = new Subject()
      const a = fake.throws('my error')
      const b = fake()
      const clock = useFakeTimers()

      s.subscribe(a)
      s.subscribe(b)

      s.next(11)
      s.next(22)
      s.next(33)

      assert(a.calledOnce)
      assert(b.calledWith(22))
      assert(b.calledWith(33))

      assert.throws(() => clock.runAll(), /my error/)

      clock.restore()
    })
  })
})
