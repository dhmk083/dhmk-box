import * as React from 'react';
export class Input extends React.Component {
    constructor() {
        super(...arguments);
        this.onChange = (ev) => this.props.set(ev.target.value);
    }
    render() {
        const { get, set, ...rest } = this.props;
        return React.createElement("input", Object.assign({ value: get(), onChange: this.onChange }, rest));
    }
}
export class Checkbox extends React.Component {
    constructor() {
        super(...arguments);
        this.onChange = (ev) => this.props.set(ev.target.checked);
    }
    render() {
        const { get, set, ...rest } = this.props;
        return React.createElement("input", Object.assign({ type: 'checkbox', checked: get(), onChange: this.onChange }, rest));
    }
}
export class Radio extends React.Component {
    constructor() {
        super(...arguments);
        this.onChange = () => this.props.set(this.props.value);
    }
    render() {
        const { get, set, name, value, ...rest } = this.props;
        return React.createElement("input", Object.assign({ type: 'radio', name: name, checked: get().toString() === value, onChange: this.onChange }, rest));
    }
}
export class Select extends React.Component {
    constructor() {
        super(...arguments);
        this.onChange = (ev) => this.props.set(ev.target.value);
    }
    render() {
        const { get, set, items, ...rest } = this.props;
        return (React.createElement("select", Object.assign({ value: get(), onChange: this.onChange }, rest), items().map(x => React.createElement("option", { key: x, value: x }, x))));
    }
}
export class Textarea extends React.Component {
}
