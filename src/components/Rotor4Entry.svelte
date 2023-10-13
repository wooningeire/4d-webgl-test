<script lang="ts" context="module">
let currentInstanceId = 0n;
</script>

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


//#region Entry data
const invertedPlanes = Array(7).fill(false);


let entryDataRotor = {
    value: new Rotor4(),
    invertedPlanes,

    rotor() {
        return this.value.map((comp, i) => comp * (this.invertedPlanes[i] ? -1 : 1));
    },
};
let entryDataPlaneAngle = {
    value: {
        angle: 0,
        plane: [0, 0, 0, 0, 0, 0],
    },
    invertedPlanes,
};
const {Xy, Xz, Xw, Yz, Yw, Zw} = Euler4.Plane;
let enteredValueEuler = new Euler4(
    [0, 0, 0, 0, 0, 0],
    [Xz, Yz, Xy, Xw, Yw, Zw],
);
const onInput = () => {
    currentValueEdited = true;

    switch (entryMode) {
        // Do not mutate `rotor` from here
        case EntryMode.Rotor:
            rotor.copy(new Polymultivector(entryDataRotor.rotor()).normalize());
            break;

        case EntryMode.PlaneAngle: {
            rotor.copy(Rotor4.planeAngle(entryDataPlaneAngle.value.plane, entryDataPlaneAngle.value.angle));
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
            entryDataRotor.value.copy(rotor.map((comp, i) => comp * (entryDataRotor.invertedPlanes[i - 1] ? -1 : 1)));
            entryDataRotor = entryDataRotor;
            break;

        case EntryMode.PlaneAngle: {
            const plane = rotor.plane;
            const newPlane = plane.some(isNaN)
                    ? Array(7).fill(0)
                    : plane;

            entryDataPlaneAngle.value = {
                angle: rotor.angle,
                plane: newPlane.map((comp, i) => comp * (entryDataRotor.invertedPlanes[i] ? -1 : 1)),
            }
            entryDataPlaneAngle = entryDataPlaneAngle;
            break;
        }

        case EntryMode.Euler:
            enteredValueEuler = Euler4.fromRotor(rotor, enteredValueEuler.planeOrdering);
            break;
    }
};

const onPlaneInvert = (index: number) => {
    switch (entryMode) {
        case EntryMode.Rotor:
            entryDataRotor.invertedPlanes[index] = !entryDataRotor.invertedPlanes[index];
            updateRotorInputs();
            break;

        case EntryMode.PlaneAngle:
            entryDataPlaneAngle.invertedPlanes[index] = !entryDataPlaneAngle.invertedPlanes[index];
            updateRotorInputs();
            break;

        case EntryMode.Euler:
            break;
    }
};

const planeLabels = new Map([
    [Xy, ["XY", "YX"]],
    [Xz, ["XZ", "ZX"]],
    [Xw, ["XW", "WX"]],
    [Yz, ["YZ", "ZY"]],
    [Yw, ["YW", "WY"]],
    [Zw, ["ZW", "WZ"]],
    [6, ["XYZW", "−XYZW"]],
]);
const rotorPlaneLabel = (index: number) => {
    return planeLabels.get(index)?.[Number(entryDataRotor.invertedPlanes[index])];
};

//#endregion

let instanceId = currentInstanceId;
currentInstanceId++;
const labelId = (string: string) => `rotor-${instanceId}-${string}`;
</script>

<rotor-entry>
    <select bind:value={entryMode}>
        <option value={EntryMode.Rotor}>Rotor</option>
        <option value={EntryMode.PlaneAngle}>Plane–angle</option>
        <option value={EntryMode.Euler}>Euler</option>
    </select>

    {#if entryMode === EntryMode.Rotor}
        <div class="key-value">
            <label for={labelId("1")}>1</label>
            <BaseEntry bind:value={entryDataRotor.value[0]}
                    on:input={onInput}
                    elementId={labelId("1")} />

            <button on:click={() => onPlaneInvert(0)}>{entryDataRotor.invertedPlanes[0], rotorPlaneLabel(0)}</button>
            <BaseEntry bind:value={entryDataRotor.value[1]}
                    on:input={onInput} />

            <button on:click={() => onPlaneInvert(1)}>{entryDataRotor.invertedPlanes[1], rotorPlaneLabel(1)}</button>
            <BaseEntry bind:value={entryDataRotor.value[2]}
                    on:input={onInput} />

            {#if showWAxis}
                <button on:click={() => onPlaneInvert(2)}>{entryDataRotor.invertedPlanes[2], rotorPlaneLabel(2)}</button>
                <BaseEntry bind:value={entryDataRotor.value[3]}
                        on:input={onInput} />
            {/if}

            <button on:click={() => onPlaneInvert(3)}>{entryDataRotor.invertedPlanes[3], rotorPlaneLabel(3)}</button>
            <BaseEntry bind:value={entryDataRotor.value[4]}
                    on:input={onInput} />

            {#if showWAxis}
                <button on:click={() => onPlaneInvert(4)}>{entryDataRotor.invertedPlanes[4], rotorPlaneLabel(4)}</button>
                <BaseEntry bind:value={entryDataRotor.value[5]}
                        on:input={onInput} />

                <button on:click={() => onPlaneInvert(5)}>{entryDataRotor.invertedPlanes[5], rotorPlaneLabel(5)}</button>
                <BaseEntry bind:value={entryDataRotor.value[6]}
                        on:input={onInput} />

                <button on:click={() => onPlaneInvert(6)}>{entryDataRotor.invertedPlanes[6], rotorPlaneLabel(6)}</button>
                <BaseEntry bind:value={entryDataRotor.value[7]}
                        on:input={onInput} />
            {/if}

        </div>
    {:else if entryMode === EntryMode.PlaneAngle}
        <div class="plane-angle">
            <div class="angle"
                    style:--progress={mod(entryDataPlaneAngle.value.angle, 2 * Math.PI)}>
                <div class="annulus"></div>
                <BaseEntry bind:value={entryDataPlaneAngle.value.angle}
                        convertIn={angle => angle / 180 * Math.PI}
                        convertOut={angle => angle * 180 / Math.PI}
                        transformDisplayValue={value => `${value}°`}
                        nDecimals={1}
                        on:input={onInput} />
            </div>

            <div class="plane"
                    class:no-w={!showWAxis}>

                <div style="--x: 1; --y; 1;">
                    <button on:click={() => onPlaneInvert(0)}>{entryDataPlaneAngle.invertedPlanes[0], rotorPlaneLabel(0)}</button>
                    <BaseEntry bind:value={entryDataPlaneAngle.value.plane[0]}
                            on:input={onInput} />
                </div>
                <div style="--x: 2; --y; 1;">
                    <button on:click={() => onPlaneInvert(1)}>{entryDataPlaneAngle.invertedPlanes[1], rotorPlaneLabel(1)}</button>
                    <BaseEntry bind:value={entryDataPlaneAngle.value.plane[1]}
                            on:input={onInput} />
                </div>
                {#if showWAxis}
                    <div style="--x: 3; --y; 1;">
                        <button on:click={() => onPlaneInvert(2)}>{entryDataPlaneAngle.invertedPlanes[2], rotorPlaneLabel(2)}</button>
                        <BaseEntry bind:value={entryDataPlaneAngle.value.plane[2]}
                                on:input={onInput} />
                    </div>
                {/if}
                <div style="--x: 2; --y; 2;">
                    <button on:click={() => onPlaneInvert(3)}>{entryDataPlaneAngle.invertedPlanes[3], rotorPlaneLabel(3)}</button>
                    <BaseEntry bind:value={entryDataPlaneAngle.value.plane[3]}
                            on:input={onInput} />
                </div>
                {#if showWAxis}
                    <div style="--x: 3; --y; 2;">
                        <button on:click={() => onPlaneInvert(4)}>{entryDataPlaneAngle.invertedPlanes[4], rotorPlaneLabel(4)}</button>
                        <BaseEntry bind:value={entryDataPlaneAngle.value.plane[4]}
                                on:input={onInput} />
                    </div>
                    <div style="--x: 3; --y; 3;">
                        <button on:click={() => onPlaneInvert(5)}>{entryDataPlaneAngle.invertedPlanes[5], rotorPlaneLabel(5)}</button>
                        <BaseEntry bind:value={entryDataPlaneAngle.value.plane[5]}
                                on:input={onInput} />
                    </div>
                {/if}
            </div>

            {#if showWAxis}
                <div>
                    <button on:click={() => onPlaneInvert(6)}>{entryDataPlaneAngle.invertedPlanes[6], rotorPlaneLabel(6)}</button>
                    <BaseEntry bind:value={entryDataPlaneAngle.value.plane[6]}
                            on:input={onInput} />
                </div>
            {/if}
        </div>
    {:else if entryMode === EntryMode.Euler}
        <div class="key-value">
            {#each enteredValueEuler.angles as angle, i}
                {#if showWAxis || i < 3}
                    <label>{planeLabels.get(enteredValueEuler.planeOrdering[i])?.[0]}</label>
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