import * as React from 'react';
// import {gid} from '../index'
// import {arrayRemove} from '../utils'
import { Reactive } from '../rex';
import { Select, Input, Checkbox } from '../input';
const FormContext = React.createContext(undefined);
export function Form({ src, onSubmit, children }) {
    return React.createElement(FormContext.Provider, { value: src },
        React.createElement("form", { onSubmit: ev => { ev.preventDefault(); src.submit(onSubmit); }, onReset: ev => { ev.preventDefault(); src.reset(); } }, children));
}
export function Model({ src, children }) {
    return React.createElement(FormContext.Provider, { value: src }, children);
}
function checkNameSrc(name, src) {
    if (name && src)
        throw new Error('both `name` and `src` are specified');
    if (!name && !src)
        throw new Error('either `name` or `src` is required');
}
function renderDefaultField({ field, Widget, widgetProps }) {
    return React.createElement("div", { className: 'field' },
        React.createElement(FieldLabel, { src: field }),
        React.createElement(Widget, Object.assign({}, widgetProps)),
        React.createElement(FieldError, { src: field }));
}
function renderField(field, children) {
    const get = () => field.raw;
    const set = (x) => { field.raw = x; field.touched = true; };
    const onBlur = () => field.touched = true;
    let render;
    if (typeof children === 'function') {
        render = () => children({ field, get, set, onBlur, FieldLabel, FieldError });
    }
    else {
        const widgetProps = { id: field.name, get, set, onBlur };
        const Widget = typeof children === 'function' ?
            undefined :
            pickWidget(field.descriptor);
        render = () => renderDefaultField({ field, Widget, widgetProps });
    }
    return React.createElement(Reactive, { on: field.changed }, render);
}
export function WithField({ name, children }) {
    return React.createElement(FormContext.Consumer, null, form => {
        if (!form)
            throw new Error('form context not found');
        const field = form.fields[name];
        if (!field)
            throw new Error(`field named "${name}" not found`);
        return children(field, form);
    });
}
export function Field({ name, src, children }) {
    checkNameSrc(name, src);
    if (src) {
        return renderField(src, children);
    }
    else {
        return React.createElement(WithField, { name: name }, field => renderField(field, children));
    }
}
function renderLabel(src) {
    const l = src.descriptor.label()();
    return React.createElement(React.Fragment, null, l && React.createElement("label", { htmlFor: src.name }, l));
}
export function FieldLabel({ name, src }) {
    checkNameSrc(name, src);
    if (name) {
        return React.createElement(WithField, { name: name }, renderLabel);
    }
    else
        return renderLabel(src);
}
function renderError(src) {
    return React.createElement(Reactive, { on: src.changed }, () => src.touched && src.error && React.createElement("div", { className: `field-error ${src.name}` }, src.error) || null);
}
export function FieldError({ name, src }) {
    checkNameSrc(name, src);
    if (name) {
        return React.createElement(WithField, { name: name }, renderError);
    }
    else
        return renderError(src);
}
export function FormError() {
    return React.createElement(FormContext.Consumer, null, form => React.createElement(Reactive, { on: form.changed }, () => form.hasErrors && React.createElement("div", { className: `form-error ${form.name}` }, form.errors._)));
}
export function Submit({ children }) {
    return React.createElement(FormContext.Consumer, null, form => React.createElement(Reactive, { on: form.changed }, () => React.createElement("button", { type: 'submit', disabled: form.hasErrors }, typeof children === 'function' ? children(form) : children)));
}
function pickWidget(desc) {
    if (desc.type === 'optional') {
        desc = desc.meta;
    }
    if (desc.type === 'number' || desc.type === 'string' || desc.type === 'literal') {
        const { meta } = desc.validator() || {};
        const choices = meta && meta.choices;
        // min, max, required, etc... ?
        if (choices) {
            const items = () => choices;
            return (props) => React.createElement(Select, Object.assign({ items: items }, props));
        }
        else {
            return (props) => React.createElement(Input, Object.assign({}, props));
        }
    }
    if (desc.type === 'boolean') {
        return (props) => React.createElement(Checkbox, Object.assign({}, props));
    }
    if (desc.type === 'array') {
        // const subType = desc.meta
        // if subType in 'number', 'string', 'object': {value, name} or similar
        // return MultiSelect
    }
    throw new Error('unsupported descriptor type: ' + desc.type);
}
// export class ArrayField<T> extends React.Component {
//   _keys!: ReadonlyArray<string>
//   _lastVal?: ReadonlyArray<T>
//   render() {
//     const {get, set, field, children} = this.props
//     const ard = field.descriptor
//     const itd = ard.meta
//     const items = get()
//     if (this._lastVal !== items) {
//       this._keys = items.map(gid)
//     }
//     const add = () => {
//       this._keys = this._keys.concat(gid())
//       this._lastVal = items.concat(itd.default())
//       set(this._lastVal)
//     }
//     const remove = (n: number) => {
//       this._keys = this._keys.filter((_, i) => n !== i)
//       this._lastVal = items.filter((_, i) => n !== i)
//       set(this._lastVal)
//     }
//     const modify = (n: number, v) => {
//       this._lastVal = items.map((x, i) => n === i ? v : x)
//       set(this._lastVal)
//     }
//     const clear = () => {
//       this._lastVal = []
//       set(this._lastVal)
//     }
//     return children({items, keys: this._keys, add, remove, modify, clear})
//   }
// }
