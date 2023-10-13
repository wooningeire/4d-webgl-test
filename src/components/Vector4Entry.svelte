<script lang="ts" context="module">
let currentInstanceId = 0n;
</script>

<script lang="ts">
import type { Vector4 } from "@/lib/4d/vector";
import BaseEntry from "./BaseEntry.svelte";

export let vector: Vector4;
export let showWAxis = true;

let instanceId = currentInstanceId;
currentInstanceId++;
const labelId = (string: string) => `rotor-${instanceId}-${string}`;
</script>

<vector-entry>
    <label for={labelId("x")}>X</label>
    <BaseEntry bind:value={vector[0]}
            elementId={labelId("x")} />
    <label for={labelId("y")}>Y</label>
    <BaseEntry bind:value={vector[1]}
            elementId={labelId("y")} />
    <label for={labelId("z")}>Z</label>
    <BaseEntry bind:value={vector[2]}
            elementId={labelId("z")} />
    {#if showWAxis}
        <label for={labelId("w")}>W</label>
        <BaseEntry bind:value={vector[3]}
                elementId={labelId("w")} />
    {/if}
</vector-entry>

<style lang="scss">
vector-entry {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 0.5rem;

    > label {
        text-align: right;
    }
}
</style>