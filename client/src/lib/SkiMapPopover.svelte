<script lang="ts">
    let { onClose } = $props<{ onClose: () => void }>();

    import mapImage from "../assets/skikart.jpg";
</script>

<div class="overlay" onclick={onClose} aria-hidden="true">
    <div
        class="modal ski-map-modal"
        onclick={(e) => e.stopPropagation()}
        aria-hidden="true"
    >
        <header class="modal-header">
            <h3>Ski Map</h3>
            <button class="modal-close-btn" onclick={onClose}>&times;</button>
        </header>

        <div class="map-container">
            <img src={mapImage} alt="Ski Map" class="ski-map-img" />
        </div>
    </div>
</div>

<style>
    .ski-map-modal {
        max-width: 90vw;
        width: 800px;
    }

    .map-container {
        flex: 1;
        overflow: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.3);
        border-radius: var(--radius-md);
        min-height: 300px;
    }

    .ski-map-img {
        max-width: 100%;
        height: auto;
        border-radius: var(--radius-sm);
    }
</style>
