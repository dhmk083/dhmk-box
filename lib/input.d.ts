import * as React from 'react';
declare type GetSet = {
    get(): any;
    set(x: any): void;
};
export declare class Input extends React.Component<GetSet & React.InputHTMLAttributes<HTMLInputElement>> {
    onChange: (ev: any) => void;
    render(): JSX.Element;
}
export declare class Checkbox extends React.Component<GetSet & React.InputHTMLAttributes<HTMLInputElement>> {
    onChange: (ev: any) => void;
    render(): JSX.Element;
}
export declare class Radio extends React.Component<GetSet & {
    name: string;
    value: string;
} & React.InputHTMLAttributes<HTMLInputElement>> {
    onChange: () => void;
    render(): JSX.Element;
}
export declare class Select extends React.Component<GetSet & {
    items(): ReadonlyArray<any>;
} & React.SelectHTMLAttributes<HTMLSelectElement>> {
    onChange: (ev: any) => void;
    render(): JSX.Element;
}
export declare class Textarea extends React.Component<GetSet & React.TextareaHTMLAttributes<HTMLTextAreaElement>> {
}
export {};
