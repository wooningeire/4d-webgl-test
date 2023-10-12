<script lang="ts">
import type { Rotor4 } from "@/lib/4d/vector";
import BaseEntry from "./BaseEntry.svelte";

export let rotor: Rotor4;
export let showWAxis = true;

enum EntryMode {
    Rotor,
    PlaneAngle,
    Euler,
}
let entryMode = EntryMode.Rotor;
</script>

<rotor-entry>
    <select bind:value={entryMode}>
        <option value={EntryMode.Rotor}>Rotor</option>
        <option value={EntryMode.PlaneAngle}>Plane–angle</option>
        <option value={EntryMode.Euler}>Euler</option>
    </select>

    {#if entryMode === EntryMode.Rotor}
        <div class="octuplet">
            <label>1</label>
            <BaseEntry bind:value={rotor[0]} />
            <label>XY</label>
            <BaseEntry bind:value={rotor[1]} />
            <label>XZ</label>
            <BaseEntry bind:value={rotor[2]} />
            {#if showWAxis}
                <label>XW</label>
                <BaseEntry bind:value={rotor[3]} />
            {/if}
            <label>YZ</label>
            <BaseEntry bind:value={rotor[4]} />
            {#if showWAxis}
                <label>YW</label>
                <BaseEntry bind:value={rotor[5]} />
                <label>ZW</label>
                <BaseEntry bind:value={rotor[6]} />
                <label>XYZW</label>
                <BaseEntry bind:value={rotor[7]} />
            {/if}
        </div>
    {:else if entryMode === EntryMode.PlaneAngle}
        {@const angle = rotor.angle}
        {@const plane = rotor.plane}

        {@debug plane}
    
        <div class="plane-angle">
            <div class="angle"
                    style:--progress={angle}>
                <div class="annulus"></div>
                <BaseEntry value={angle * 180 / Math.PI}
                        transformDisplayValue={value => `${value}°`} />
            </div>

            <div class="plane"
                    class:no-w={!showWAxis}>
                <div style="--x: 1; --y; 1;">
                    <label>XY</label>
                    <BaseEntry value={plane[0]} />
                </div>
                <div style="--x: 2; --y; 1;">
                    <label>XZ</label>
                    <BaseEntry value={plane[1]} />
                </div>
                {#if showWAxis}
                    <div style="--x: 3; --y; 1;">
                        <label>XW</label>
                        <BaseEntry value={plane[2]} />
                    </div>
                {/if}
                <div style="--x: 2; --y; 2;">
                    <label>YZ</label>
                    <BaseEntry value={plane[3]} />
                </div>
                {#if showWAxis}
                    <div style="--x: 3; --y; 2;">
                        <label>YW</label>
                        <BaseEntry value={plane[4]} />
                    </div>
                    <div style="--x: 3; --y; 3;">
                        <label>ZW</label>
                        <BaseEntry value={plane[5]} />
                    </div>
                {/if}
            </div>

            {#if showWAxis}
                <div>
                    <label>XYZW</label>
                    <BaseEntry value={plane[6]} />
                </div>
            {/if}
        </div>
    {/if}
</rotor-entry>

<style lang="scss">
rotor-entry {
    display: flex;
    flex-flow: column;
    gap: 0.5rem;
    align-items: center;
}

.octuplet {
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