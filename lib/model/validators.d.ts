import { Validator } from './types';
export declare function combine(...args: Validator<any>[]): Validator<any> | undefined;
export declare function choices(a: ReadonlyArray<any>): {
    (x: any): string | undefined;
    meta: {
        choices: ReadonlyArray<any>;
    };
};
declare type RangeErrorMessage = (x: any, min: number, max: number) => string;
export declare function range(min: number, max: number, errorMessage?: RangeErrorMessage): {
    (x: any): string | undefined;
    meta: {
        min: number;
        max: number;
    };
};
export declare namespace range {
    var errorMessage: RangeErrorMessage;
}
export declare function required(msg?: string): {
    (x: any): string | undefined;
    meta: {
        required: boolean;
    };
};
export declare function eq(val: any): {
    (x: any): string | undefined;
    meta: {
        eq: any;
    };
};
export {};
