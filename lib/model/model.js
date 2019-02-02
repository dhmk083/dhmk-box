var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Changeable, notify } from '../ch';
import { pipe, filter } from '../reoperators';
import { objectMap, arrayToObject } from '../utils';
// Always holds valid values.
// If initial values are invalid - throws in ctor.
// Notifies only when a valid value has been set
class Model extends Changeable {
    constructor(descriptors, validator) {
        super();
        this.descriptors = descriptors;
        this.validator = validator;
        this._values = objectMap(descriptors, x => x.default());
        //validate once and throw
        for (const k in descriptors) {
            const e = descriptors[k].validate(this._values[k]);
            if (e) {
                throw new Error('Model has been supplied with invalid initial values: ' + e);
            }
        }
    }
    get values() { return this._values; }
    set(x, cast) {
        const errors = [];
        for (const k in x) {
            const desc = this.descriptors[k];
            const v = cast ? desc.cast()(x[k]) : x[k];
            const e = desc.validate(v);
            if (e)
                errors.push([k, e]);
        }
        if (!errors.length && this.validator) {
            const moreErrors = this.validator(this._values);
            for (const k in moreErrors) {
                if (k !== '_' && !(k in this.descriptors))
                    continue;
                const e = moreErrors[k];
                if (e)
                    errors.push([k, e]);
            }
        }
        if (!errors.length) {
            for (const k in x) {
                this._values[k] = x[k];
                this.notify(k);
            }
        }
        return arrayToObject(errors);
    }
}
class FormModel extends Changeable {
    constructor(descriptors, validator) {
        super();
        this.descriptors = descriptors;
        this.validator = validator;
        this.name = '';
        this.isSubmitting = false;
        this.fields = {};
        this.errors = { _: undefined };
        this._values = {};
        this._errorsCount = 0;
        for (const k in descriptors) {
            this.fields[k] = new FormField(this, k, () => this.notify(k), pipe(this.changed, filter(k)));
        }
        this.reset();
    }
    get hasErrors() { return !!this._errorsCount || !!this.errors._; }
    get values() {
        if (this.hasErrors)
            throw new Error('Form has errors.');
        return this._values;
    }
    set(x, cast = true) {
        this._checkBusy();
        for (const k in x) {
            if (!(k in this.descriptors))
                continue;
            const desc = this.descriptors[k];
            const v = x[k];
            this._setField(k, cast ? desc.cast()(v) : v, false);
        }
        this._validateAll();
    }
    async submit(fn) {
        this._checkBusy();
        const values = this.values;
        this.isSubmitting = true;
        try {
            const errors = await fn(values);
            this._setErrors(errors || {});
        }
        finally {
            this.isSubmitting = false;
        }
    }
    reset() {
        this._checkBusy();
        for (const k in this.descriptors) {
            const desc = this.descriptors[k];
            this._setField(k, desc.default(), false);
            this.fields[k].touched = false;
        }
        this._validateAll();
    }
    setError(k, e) {
        this._checkBusy();
        this._setError(k, e);
    }
    setContext(k, context) {
        this.fields[k].context = context;
    }
    _setError(k, e) {
        const prevE = this.errors[k];
        this.errors[k] = e;
        if (prevE && !e) {
            this._errorsCount--;
        }
        if (!prevE && e) {
            this._errorsCount++;
        }
        this.notify(k);
    }
    /*internal*/
    _setField(k, v, validateAll = true) {
        const e = this.descriptors[k].validate(v);
        this._values[k] = v;
        this._setError(k, e);
        if (validateAll)
            this._validateAll();
    }
    _validateAll() {
        if (this.hasErrors || !this.validator)
            return;
        const errors = this.validator(this.values);
        this._setErrors(errors || {});
    }
    _setErrors(errors) {
        for (const k in errors) {
            if (!(k in this.errors))
                continue;
            this._setError(k, errors[k]);
        }
    }
    _checkBusy() {
        if (this.isSubmitting)
            throw new Error('Form is busy.');
    }
}
__decorate([
    notify
], FormModel.prototype, "isSubmitting", void 0);
/*internal*/
class FormField {
    constructor(form, key, 
    // @ts-ignore
    notify, changed) {
        this.form = form;
        this.key = key;
        this.notify = notify;
        this.changed = changed;
        this.touched = false;
        this.context = undefined;
    }
    get descriptor() { return this.form.descriptors[this.key]; }
    get name() { return this.form.name + '-' + this.key; }
    get error() { return this.form.errors[this.key]; }
    get raw() { return this.form._values[this.key]; }
    set raw(x) {
        const v = this.descriptor.cast()(x);
        this.form._setField(this.key, v);
    }
}
__decorate([
    notify
], FormField.prototype, "touched", void 0);
__decorate([
    notify
], FormField.prototype, "context", void 0);
export function model(descriptors, modelValidator) {
    return new Model(descriptors, modelValidator);
}
export function form(descriptors, modelValidator) {
    return new FormModel(descriptors, modelValidator);
}
