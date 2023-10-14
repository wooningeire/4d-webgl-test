<script lang="ts">
import {flip} from "svelte/animate";
import {cubicOut} from "svelte/easing";

import BaseEntry from "./BaseEntry.svelte";
import Drag from "./Drag.svelte";

import { Euler4, EulerPlane } from "@/lib/4d/CameraControl4";
    import type { Multiple } from "@/lib/util";

export let euler: Euler4;

export let showWAxis: boolean = true;

const {Xy, Xz, Xw, Yz, Yw, Zw} = Euler4.Plane;
const planeLabels = new Map([
    [Xy, ["XY", "YX"]],
    [Xz, ["XZ", "ZX"]],
    [Xw, ["XW", "WX"]],
    [Yz, ["YZ", "ZY"]],
    [Yw, ["YW", "WY"]],
    [Zw, ["ZW", "WZ"]],
]);


let rowOrder = [0, 1, 2, 3, 4, 5];
const originalPlaneOrdering = [...euler.planeOrdering];
const invertedPlanes = Array(6).fill(false);

let draggedRow = -1;
let animatingRows = new Set();

const animationDuration = 200;
const swapDraggedWith = (targetIndex: number) => {
    if (draggedRow === targetIndex || animatingRows.has(targetIndex)) return;

    animatingRows.add(targetIndex);
    setTimeout(() => animatingRows.delete(targetIndex), animationDuration);

    const indexA = rowOrder.indexOf(draggedRow);
    const indexB = rowOrder.indexOf(targetIndex);
    rowOrder[indexA] = targetIndex;
    rowOrder[indexB] = draggedRow;
    rowOrder = rowOrder;
};

$: rowOrder, (() => {
    const newPlaneOrdering = rowOrder.map(index => originalPlaneOrdering[index]) as Multiple<6, EulerPlane>;
    euler = Euler4.fromRotor(euler.asRotor(), newPlaneOrdering);
})();
</script>


{#each euler.angles as angle, i (rowOrder[i])}
    {@const planeIndex = rowOrder[i]}

    <div animate:flip={{duration: animationDuration, easing: cubicOut}}
            on:dragstart={event => {
                draggedRow = rowOrder[i];
                event.dataTransfer?.setDragImage(new Image(), 0, 0);
            }}
            on:dragend={() => draggedRow = -1}
            on:dragenter={() => swapDraggedWith(rowOrder[i])}
            on:dragover|preventDefault
            on:transitionend={() => {
                animatingRows.delete(rowOrder[i]);
            }}>
        {#if showWAxis || i < 3}
            <Drag />

            <select bind:value={originalPlaneOrdering[planeIndex]}>
                {#each [...planeLabels.keys()] as plane}
                    {#if showWAxis || ![Xw, Yw, Zw].includes(plane)}
                        <option value={plane}>{planeLabels.get(plane)?.[0]}</option>
                    {/if}
                {/each}
            </select>
            <BaseEntry bind:value={angle}
                    convertIn={angle => angle / 180 * Math.PI}
                    convertOut={angle => angle * 180 / Math.PI}
                    transformDisplayValue={value => `${value}°`}
                    on:input />
        {/if}
    </div>
{/each}

<style lang="scss">
div {
    display: flex;
    column-gap: 0.5rem;
    align-items: center;
}
</style>