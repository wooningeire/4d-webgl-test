<script lang="ts">
    import { createEventDispatcher } from "svelte";

const acceptAlways = () => true;
const identity = (value: number) => value;

export let value = 0;

export let validate: (proposedValue: number) => boolean = isFinite;
export let convertIn: (value: number) => number = identity;
export let convertOut: (value: number) => number = identity;

export let hasBounds = true;

export let step = 1e-3;

const dispatch = createEventDispatcher<{
    change: number,
}>();


let proposedValueIsValid = true;
let entryActive = false;

let element: HTMLInputElement | null = null;

let displayValue = convertOut(value).toString();


const setDisplayToTrueValue = () => {
    displayValue = convertOut(value).toString();
};


const onInput = () => {
    entryActive = true;

    const proposedValue = convertIn(Number(displayValue));
    proposedValueIsValid = validate(proposedValue);

    if (proposedValueIsValid) {
        value = proposedValue;
    }
};

const onChange = () => {
    entryActive = false;
    setDisplayToTrueValue();
    proposedValueIsValid = true;
};

const onBlur = () => {
    entryActive = false;
};

const onClick = () => {
    if (entryActive) return;

    entryActive = true;
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
        class:inputing={entryActive} />

<style lang="scss">
input {
	background: linear-gradient(90deg,
			var(--col-slider-progress) var(--slider-progress-pct),
			var(--col-slider-empty) var(--slider-progress-pct));
	border: none;
	color: inherit;

	margin-bottom: 0.25rem;
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
		--col-slider-empty: #d0f7e7;
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