<script lang="ts">
import dragSvg from "@/assets/drag.svg";
</script>

<img src={dragSvg}
        draggable="true"
        alt="Drag" />

<style lang="scss">
img {
    cursor: move;
    user-select: none;
    padding: 0.2rem;

    &:hover {
        filter: brightness(1.5);
    }

    &:active,
    &:focus-within {
        filter: brightness(0.5);
    }
}
</style>