<script lang="ts">
import { createEventDispatcher, tick } from "svelte";

const acceptAlways = () => true;
const identity = (value: number) => value;

export let value = 0;

export let validate: (proposedValue: number) => boolean = isFinite;
export let convertIn: (value: number) => number = identity;
export let convertOut: (value: number) => number = identity;
export let transformDisplayValue: (value: number) => string = value => value.toString();

export let hasBounds = true;

export let step = 1e-3;
export let nDecimals = 4;
export let elementId: string | undefined = undefined;

const dispatch = createEventDispatcher<{
    input: number,
    change: number,
}>();

let enteredValue = convertOut(value).toString();
let proposedValueIsValid = true;
let entryActive = false;

$: value, !entryActive && setDisplayToTrueValue();


let element: HTMLInputElement | null = null;

let displayValueUnprocessed = convertOut(value);
$: displayValue = entryActive 
        ? enteredValue
        : transformDisplayValue(Number(displayValueUnprocessed.toFixed(nDecimals)));


const setDisplayToTrueValue = () => {
    displayValueUnprocessed = convertOut(value);
    enteredValue = convertOut(value).toString();
};


const onInput = () => {
    entryActive = true;

    enteredValue = element!.value;
    const proposedValue = convertIn(Number(element!.value));
    proposedValueIsValid = validate(proposedValue);

    if (proposedValueIsValid) {
        value = proposedValue;
        dispatch("input", value);
    }
};

const onChange = () => {
    entryActive = false;
    setDisplayToTrueValue();
    proposedValueIsValid = true;

    dispatch("change", value);
};

const onBlur = () => {
    entryActive = false;
};

const onClick = async () => {
    if (entryActive) return;

    entryActive = true;

    await tick(); // Display value updates, need to wait a tick before selecting
    element!.select();
};
</script>

<input bind:value={displayValue}
        bind:this={element}
        on:input={onInput}
        on:change={onChange}
        on:blur={onBlur}
        on:click={onClick}
        class:invalid={!proposedValueIsValid}
        class:inputing={entryActive}
        id={elementId} />

<style lang="scss">
input {
    margin-bottom: 0.25rem;
    width: 100%;

	background: linear-gradient(90deg,
			var(--col-slider-progress) var(--slider-progress-pct),
			var(--col-slider-empty) var(--slider-progress-pct));
	border: none;
	color: inherit;
    
	border-radius: 4px;

	--slider-progress: 0;
	--slider-progress-pct: calc(var(--slider-progress) * 100%);

	--col-slider-progress: #ad4c64;
	--col-slider-empty: #b6dbcf;
	--col-invalid-input: #ffbac8;

	text-align: right;
	// cursor: ew-resize;

	&:hover {
		--col-slider-progress: #dd4f96;
		--col-slider-empty: #bee7d6;
	}
	
	&.inputing {
		cursor: text;

		--col-slider-progress: #693333;
		--col-slider-empty: #6d9a9a;
        color: #fff;
	}

    &.invalid {
        color: var(--col-invalid-input);
    }
}
</style>