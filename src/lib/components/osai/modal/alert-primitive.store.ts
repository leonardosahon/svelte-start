import {type Writable, writable} from "svelte/store";

export type AlertPrimitive = {
    open?: boolean;
    title?: string;
    message?: any;
    okText?: string;
    cancelText?: string;
    onDone?: (close: () => void) => Promise<any>;
    closeOnDone?: boolean;
    loading?: Writable<boolean>;
};

export const alertState = writable<AlertPrimitive>({
    open: false,
    loading: writable(false)
});
