import { onMount } from "svelte";
import { readable } from "svelte/store";

const modifierKeys = readable({
    ctrl: false,
    shift: false,
    alt: false,
    meta: false,
}, set => {
    const handler = (event: KeyboardEvent) => {
        set({
            ctrl: event.ctrlKey,
            shift: event.shiftKey,
            alt: event.altKey,
            meta: event.metaKey,
        });
    };

    let mounted = false;
    onMount(() => {
        mounted = true;

        addEventListener("keydown", handler);
        addEventListener("keyup", handler);
    });


    return () => {
        if (!mounted) return;

        removeEventListener("keydown", handler);
        removeEventListener("keyup", handler);
    };
});
export default modifierKeys;


export type ModifierKeys = {
    ctrl: boolean,
    shift: boolean,
    alt: boolean,
    meta: boolean,
};