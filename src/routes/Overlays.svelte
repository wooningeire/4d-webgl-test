<script lang="ts">
import type { Transform4 } from "@/lib/4d/Transform4";
import Vector4Entry from "@/components/Vector4Entry.svelte";
import Rotor4Entry from "@/components/Rotor4Entry.svelte";

export let camera4Transform: Transform4;
export let camera3Transform: Transform4;
</script>

<overlays->
    <overlay-window>
        <h2>4D camera</h2>
    
        <h3>Translate</h3>
        <Vector4Entry vector={camera4Transform.translate} />

        <h3>Rotate</h3>
        <Rotor4Entry rotor={camera4Transform.rotate} />
    </overlay-window>

    <overlay-window>
        <h2>3D camera</h2>
    
        <h3>Translate</h3>
        <Vector4Entry vector={camera3Transform.translate}
                showWAxis={false} />

        <h3>Rotate</h3>
        <Rotor4Entry rotor={camera3Transform.rotate}
                showWAxis={false} />
    </overlay-window>
</overlays->

<style lang="scss">
overlays- {
    pointer-events: none;
    overflow-y: auto;
    max-height: 100%;

    > * {
        pointer-events: all;
    }
}

overlay-window {
    display: flex;
    flex-flow: column;
    margin: 1rem;
    padding: 1rem;
    border: 2px solid #75a997;
    max-width: 25ch;

    border-radius: 2em / 1.5em;
    background: #def3e7af;
    box-shadow: -.5rem -.25rem 2rem #2987ac3f;
}
</style>