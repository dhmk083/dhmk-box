import * as React from 'react';
import { Bag } from '../types';
import { IForm, IFormField, AsyncModelValidator } from './types';
declare type Props<T> = T & React.Props<any>;
declare type FormProps<T> = Props<{
    src: IForm<T>;
    onSubmit: AsyncModelValidator<T>;
}>;
export declare function Form<T>({ src, onSubmit, children }: FormProps<T>): JSX.Element;
declare type ModelProps = Props<{
    src: IForm<any>;
}>;
export declare function Model({ src, children }: ModelProps): JSX.Element;
export declare function WithField(props: {
    name: string;
    children: (field: IFormField<any>, form: IForm<any>) => React.ReactNode;
}): JSX.Element;
export declare function Field(props: {
    name: string;
} & Bag): JSX.Element;
export declare function Field<T>(props: {
    src: IFormField<T>;
} & Bag): JSX.Element;
export declare function FieldLabel(props: {
    name: string;
}): JSX.Element;
export declare function FieldLabel(props: {
    src: IFormField<any>;
}): JSX.Element;
export declare function FieldError(props: {
    name: string;
}): JSX.Element;
export declare function FieldError(props: {
    src: IFormField<any>;
}): JSX.Element;
export declare function FormError(): JSX.Element;
export declare function Submit({ children }: {
    children: ((form: IForm<any>) => JSX.Element) | React.ReactChild;
}): JSX.Element;
export {};
