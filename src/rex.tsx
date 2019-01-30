import * as React from 'react'

import * as t from './types'
import {keyGetter as utilsKeyGetter} from './utils'

type ReactiveChildrenProps<T, P> = Readonly<P & {value: T | undefined}>

type ReactiveProps<T, P extends {}> = P & {
  lock?: boolean
  on?: t.IObservable<T>
  children: (props: ReactiveChildrenProps<T, P>) => React.ReactNode
}

export class Reactive<T = any, P extends {} = {}> extends React.Component<ReactiveProps<T, P>> {
  private _obs?: t.IObservable<T>
  private _conn?: t.ISubscription
  private value?: T

  componentDidMount() {
    this._updateSubscription(this.props)
  }

  componentWillUnmount() {
    this._updateSubscription({})
  }

  UNSAFE_componentWillReceiveProps(props: ReactiveProps<T, P>) {
    this._updateSubscription(props)
  }

  shouldComponentUpdate(nextProps: ReactiveProps<T, P>) {
    return !nextProps.lock
  }

  render() {
    const {value} = this
    const {lock, on, children, ...rest} = this.props

    return children({...rest, value} as ReactiveChildrenProps<T, P>)
  }

  private _updateSubscription(props: Pick<ReactiveProps<T, P>, 'on'>) {
    const obs = props.on

    if (this._obs !== obs) {
      this._conn && this._conn.unsubscribe()
      this._conn = undefined
      this._obs = obs

      if (obs) {
        this._conn = obs.subscribe(x => {
          this.value = x
          this.forceUpdate()
        })
      }
    }
  }
}

type ReListLike<T> = {
  value: ReadonlyArray<T>
  changed: t.IObservable<any>
}

function isProbablyObservable(x: any): x is t.IObservable<any> {
  return x && typeof x.subscribe === 'function'
}

function isProbablyChangeable(x: any): x is t.IChangeable<any> {
  return x && isProbablyObservable(x.changed)
}

function isProbablyReList<T>(x: any): x is ReListLike<T> {
  return Array.isArray(x.value) && isProbablyChangeable(x)
}

type ReListProps<T> = {
  source: (() => Iterable<T>) | Iterable<T> | ReListLike<T>
  on?: t.IObservable<any>
  children: (x: T, i: number) => React.ReactNode
  itemOn?: (x: T, i: number) => t.IObservable<any>
  empty?: React.ReactNode
  keyGetter?: string | number | ((x: T) => string)
}

export class ReactiveList<T> extends React.Component<ReListProps<T>> {
  render() {
    const {source, on, children, itemOn, empty, keyGetter} = this.props

    const getSource = (
      typeof source === 'function' ? source :
      isProbablyReList(source) ?
        () => source.value :
        () => source
    )

    const getKey = utilsKeyGetter(keyGetter)

    const finalOn = on || (
      isProbablyReList(source) ?
        source.changed :
        undefined
    )

    const finalItemOn = itemOn || ((x, _) => isProbablyChangeable(x) ? x.changed : undefined)

    return <Reactive on={finalOn}>
      {
        () => {
          const items = [...getSource()]

          return items.length ?
            items.map((x, i) =>
              <Reactive key={getKey(x)} on={finalItemOn(x, i)}>
                {() => children(x, i)}
              </Reactive>
            )
            :
            empty
        }
      }
    </Reactive>
  }
}
