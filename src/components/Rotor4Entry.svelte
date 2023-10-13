<script lang="ts">
import { Polymultivector, Rotor4 } from "@/lib/4d/vector";
import BaseEntry from "./BaseEntry.svelte";
import { mod } from "@/lib/util";
import { Euler4 } from "@/lib/4d/CameraControl4";

export let rotor: Rotor4;
export let showWAxis = true;

enum EntryMode {
    Rotor,
    PlaneAngle,
    Euler,
}
let entryMode = EntryMode.Rotor;

let currentValueEdited = false;

let enteredValueRotor = new Rotor4();
let enteredValuePlaneAngle = {
    angle: 0,
    plane: [0, 0, 0, 0, 0, 0],
};
const {Xy, Xz, Xw, Yz, Yw, Zw} = Euler4.Plane;
let enteredValueEuler = new Euler4(
    [0, 0, 0, 0, 0, 0],
    [Xz, Yz, Xy, Xw, Yw, Zw],
);
const onInput = () => {
    currentValueEdited = true;

    switch (entryMode) {
        case EntryMode.Rotor:
            rotor.copy(new Polymultivector(enteredValueRotor).normalize());
            // enteredValueRotor = enteredValueRotor;
            break;

        case EntryMode.PlaneAngle: {
            rotor.copy(Rotor4.planeAngle(enteredValuePlaneAngle.plane, enteredValuePlaneAngle.angle));
            // enteredValuePlaneAngle = enteredValuePlaneAngle;
            break;
        }

        case EntryMode.Euler:
            rotor.copy(enteredValueEuler.asRotor());
            break;
    }
};

$: rotor, entryMode, updateRotorInputs();
const updateRotorInputs = () => {
    currentValueEdited = false;

    switch (entryMode) {
        case EntryMode.Rotor:
            enteredValueRotor = enteredValueRotor.copy(rotor);
            break;

        case EntryMode.PlaneAngle: {
            const plane = rotor.plane;
            const newPlane = plane.some(isNaN)
                    ? Array(7).fill(0)
                    : plane;

            enteredValuePlaneAngle = {
                angle: rotor.angle,
                plane: newPlane,
            };
            break;
        }

        case EntryMode.Euler:
            enteredValueEuler = Euler4.fromRotor(rotor, enteredValueEuler.planeOrdering);
            break;
    }
};

const planeLabels = new Map([
    [Xy, "XY"],
    [Xz, "XZ"],
    [Xw, "XW"],
    [Yz, "YZ"],
    [Yw, "YW"],
    [Zw, "ZW"],
])
</script>

<rotor-entry>
    <select bind:value={entryMode}>
        <option value={EntryMode.Rotor}>Rotor</option>
        <option value={EntryMode.PlaneAngle}>Plane–angle</option>
        <option value={EntryMode.Euler}>Euler</option>
    </select>

    {#if entryMode === EntryMode.Rotor}
        <div class="key-value">
            <label>1</label>
            <BaseEntry bind:value={enteredValueRotor[0]}
                    on:input={onInput} />
            <label>XY</label>
            <BaseEntry bind:value={enteredValueRotor[1]}
                    on:input={onInput} />
            <label>XZ</label>
            <BaseEntry bind:value={enteredValueRotor[2]}
                    on:input={onInput} />
            {#if showWAxis}
                <label>XW</label>
                <BaseEntry bind:value={enteredValueRotor[3]}
                        on:input={onInput} />
            {/if}
            <label>YZ</label>
            <BaseEntry bind:value={enteredValueRotor[4]}
                    on:input={onInput} />
            {#if showWAxis}
                <label>YW</label>
                <BaseEntry bind:value={enteredValueRotor[5]}
                        on:input={onInput} />
                <label>ZW</label>
                <BaseEntry bind:value={enteredValueRotor[6]}
                        on:input={onInput} />
                <label>XYZW</label>
                <BaseEntry bind:value={enteredValueRotor[7]}
                        on:input={onInput} />
            {/if}

        </div>
    {:else if entryMode === EntryMode.PlaneAngle}
        <div class="plane-angle">
            <div class="angle"
                    style:--progress={mod(enteredValuePlaneAngle.angle, 2 * Math.PI)}>
                <div class="annulus"></div>
                <BaseEntry bind:value={enteredValuePlaneAngle.angle}
                        convertIn={angle => angle / 180 * Math.PI}
                        convertOut={angle => angle * 180 / Math.PI}
                        transformDisplayValue={value => `${value}°`}
                        nDecimals={1}
                        on:input={onInput} />
            </div>

            <div class="plane"
                    class:no-w={!showWAxis}>

                <div style="--x: 1; --y; 1;">
                    <label>XY</label>
                    <BaseEntry bind:value={enteredValuePlaneAngle.plane[0]}
                            on:input={onInput} />
                </div>
                <div style="--x: 2; --y; 1;">
                    <label>XZ</label>
                    <BaseEntry bind:value={enteredValuePlaneAngle.plane[1]}
                            on:input={onInput} />
                </div>
                {#if showWAxis}
                    <div style="--x: 3; --y; 1;">
                        <label>XW</label>
                        <BaseEntry bind:value={enteredValuePlaneAngle.plane[2]}
                                on:input={onInput} />
                    </div>
                {/if}
                <div style="--x: 2; --y; 2;">
                    <label>YZ</label>
                    <BaseEntry bind:value={enteredValuePlaneAngle.plane[3]}
                            on:input={onInput} />
                </div>
                {#if showWAxis}
                    <div style="--x: 3; --y; 2;">
                        <label>YW</label>
                        <BaseEntry bind:value={enteredValuePlaneAngle.plane[4]}
                                on:input={onInput} />
                    </div>
                    <div style="--x: 3; --y; 3;">
                        <label>ZW</label>
                        <BaseEntry bind:value={enteredValuePlaneAngle.plane[5]}
                                on:input={onInput} />
                    </div>
                {/if}
            </div>

            {#if showWAxis}
                <div>
                    <label>XYZW</label>
                    <BaseEntry bind:value={enteredValuePlaneAngle.plane[6]}
                            on:input={onInput} />
                </div>
            {/if}
        </div>
    {:else if entryMode === EntryMode.Euler}
        <div class="key-value">
            {#each enteredValueEuler.angles as angle, i}
                {#if showWAxis || i < 3}
                    <label>{planeLabels.get(enteredValueEuler.planeOrdering[i])}</label>
                    <BaseEntry bind:value={angle}
                            convertIn={angle => angle / 180 * Math.PI}
                            convertOut={angle => angle * 180 / Math.PI}
                            transformDisplayValue={value => `${value}°`}
                            on:input={onInput} />
                {/if}
            {/each}
        </div>
    {/if}

    <button on:click={updateRotorInputs}
            disabled={!currentValueEdited}>Normalize</button>
</rotor-entry>

<style lang="scss">
rotor-entry {
    display: flex;
    flex-flow: column;
    gap: 0.5rem;
    align-items: center;
}

.key-value {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 0.5rem;

    label {
        text-align: right;
    }
}

.plane-angle {
    display: flex;
    flex-flow: column;
    align-items: center;

    > .angle {
        width: 6rem;
        padding: 0 1rem;
        aspect-ratio: 1;

        display: grid;
        place-items: center;

        > :global(*) {
            grid-area: 1/1;
        }

        > .annulus {
            width: calc(100% + 2rem);
            aspect-ratio: 1;
            
            background: conic-gradient(from 0.25turn,
                    #b6dbcf5f var(--progress-angle),
                    var(--col-red) var(--progress-angle),
                    #dd4f96 calc(var(--progress-angle) + 1rad));
            mask-image: radial-gradient(closest-side, #0000 50%, #000 50%, #000 100%, #0000 100%);
        }

        :global(input) {
            z-index: 1;
        }


        --progress: 0;

        --progress-angle: calc(1turn - 1rad * var(--progress));
    }

    > .plane {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        column-gap: 0.5rem;

        &.no-w {
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(2, 1fr);
        }

        > div {
            display: flex;
            flex-flow: column;

            grid-area: var(--y) / var(--x);
            --x: auto;
            --y: auto;
        }
    }

    > div {
        display: flex;
        flex-flow: column;
    }
    
    label {
        text-align: center;
    }
}
</style>