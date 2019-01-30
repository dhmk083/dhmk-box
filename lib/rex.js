import * as React from 'react';
import { keyGetter as utilsKeyGetter } from './utils';
export class Reactive extends React.Component {
    componentDidMount() {
        this._updateSubscription(this.props);
    }
    componentWillUnmount() {
        this._updateSubscription({});
    }
    UNSAFE_componentWillReceiveProps(props) {
        this._updateSubscription(props);
    }
    shouldComponentUpdate(nextProps) {
        return !nextProps.lock;
    }
    render() {
        const { value } = this;
        const { lock, on, children, ...rest } = this.props;
        return children({ ...rest, value });
    }
    _updateSubscription(props) {
        const obs = props.on;
        if (this._obs !== obs) {
            this._conn && this._conn.unsubscribe();
            this._conn = undefined;
            this._obs = obs;
            if (obs) {
                this._conn = obs.subscribe(x => {
                    this.value = x;
                    this.forceUpdate();
                });
            }
        }
    }
}
function isProbablyObservable(x) {
    return x && typeof x.subscribe === 'function';
}
function isProbablyChangeable(x) {
    return x && isProbablyObservable(x.changed);
}
function isProbablyReList(x) {
    return Array.isArray(x.value) && isProbablyChangeable(x);
}
export class ReactiveList extends React.Component {
    render() {
        const { source, on, children, itemOn, empty, keyGetter } = this.props;
        const getSource = (typeof source === 'function' ? source :
            isProbablyReList(source) ?
                () => source.value :
                () => source);
        const getKey = utilsKeyGetter(keyGetter);
        const finalOn = on || (isProbablyReList(source) ?
            source.changed :
            undefined);
        const finalItemOn = itemOn || ((x, _) => isProbablyChangeable(x) ? x.changed : undefined);
        return React.createElement(Reactive, { on: finalOn }, () => {
            const items = [...getSource()];
            return items.length ?
                items.map((x, i) => React.createElement(Reactive, { key: getKey(x), on: finalItemOn(x, i) }, () => children(x, i)))
                :
                    empty;
        });
    }
}
