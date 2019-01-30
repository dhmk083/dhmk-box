import * as Benchmark from 'benchmark'
import {subj} from '../src/core'
import {Subject} from '../src/re'
import {Subject as SubjectRx} from 'rxjs'

function range(n: number) {
  return new Array(n).fill(0)
}

function listener(x: any) { return x + 5 }

function test(fn: any) {
  const N = 100
  const a = range(N).map(() => fn())
  const b = a.map(x => range(N).map(() => x.subscribe(listener)))
  a.forEach(x => range(N).forEach(() => x.next(1)))
  b.forEach(x => x.forEach(y => y.unsubscribe()))
}

new Benchmark.Suite()
  .add('rx', function() {
    test(() => new SubjectRx())
  })
  .add('re', function() {
    test(() => new Subject())
  })
  .add('subj', function() {
    test(() => subj())
  })
  .on('cycle', function(event: any) {
    console.log(event.target.toString())
  })
  .on('complete', function(this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({async: true})
