<script lang="ts">
import type { Vector4 } from "@/lib/4d/vector";
import BaseEntry from "./BaseEntry.svelte";

export let vector: Vector4;
export let showWAxis = true;
</script>

<vector-entry>
    <label>X</label>
    <BaseEntry bind:value={vector[0]} />
    <label>Y</label>
    <BaseEntry bind:value={vector[1]} />
    <label>Z</label>
    <BaseEntry bind:value={vector[2]} />
    {#if showWAxis}
        <label>W</label>
        <BaseEntry bind:value={vector[3]} />
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