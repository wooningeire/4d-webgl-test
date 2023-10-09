<script lang="ts">
import type { Transform4 } from "@/lib/4d/Transform4";
import Vector4Entry from "@/components/Vector4Entry.svelte";

export let camera4Transform: Transform4;
</script>

<overlays->
    <overlay-window>
        <h2>4D camera</h2>
    
        <h3>Translate</h3>
        <Vector4Entry vector={camera4Transform.translate} />
    </overlay-window>
</overlays->

<style lang="scss">
overlay-window {
    display: flex;
    flex-flow: column;
    margin: 1rem;
    padding: 1rem;
    border: 2px solid #75a997;

    max-width: 25ch;

    border-radius: 2em / 1.5em;
}
</style>