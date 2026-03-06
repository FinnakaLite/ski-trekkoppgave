<script lang="ts">
    import { ROUTES_MAP, type Bakker, type Heiser } from "./routesMap";

    interface LiftRide {
        heisTurid: number;
        heis: Heiser;
        timeStart: string;
    }

    interface RouteRecord {
        turID: number;
        cardSerial: string;
        timeFirstLift: string;
        timeEndLift: string;
        route: Bakker[];
        startHeisTur: LiftRide;
        endHeisTur: LiftRide;
    }

    let {
        routeRecord,
        API_BASE_URL,
        onClose,
        onUpdate,
    }: {
        routeRecord: RouteRecord;
        API_BASE_URL: string;
        onClose: () => void;
        onUpdate: () => void;
    } = $props();

    let isUpdating = $state(false);
    let error = $state<string | null>(null);

    // Get possible routes for this start/end pair
    const possibleRoutes = $derived(
        ROUTES_MAP[routeRecord.startHeisTur.heis]?.[
            routeRecord.endHeisTur.heis
        ] || [],
    );

    const updateRoute = async (newRoute: Bakker[]) => {
        isUpdating = true;
        error = null;
        try {
            const response = await fetch(
                `${API_BASE_URL}/routes/${routeRecord.turID}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        cardSerial: routeRecord.cardSerial,
                        nyRoute: newRoute,
                    }),
                },
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update route");
            }

            onUpdate();
            onClose();
        } catch (err) {
            error = err instanceof Error ? err.message : "An error occurred";
        } finally {
            isUpdating = false;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString("no-NO", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const isCurrentRoute = (route: Bakker[]) => {
        return JSON.stringify(route) === JSON.stringify(routeRecord.route);
    };
</script>

<div class="overlay" onclick={onClose} aria-hidden="true">
    <div
        class="modal card-glass"
        onclick={(e) => e.stopPropagation()}
        aria-hidden="true"
    >
        <header class="modal-header">
            <h3>Trip #{routeRecord.turID}</h3>
            <button class="close-btn" onclick={onClose}>&times;</button>
        </header>

        <div class="timeline">
            <div class="node">
                <span class="node-label">Start</span>
                <span class="node-lift">{routeRecord.startHeisTur.heis}</span>
                <span class="node-time"
                    >{formatDate(routeRecord.startHeisTur.timeStart)}</span
                >
            </div>
            <div class="connector">
                <div class="line"></div>
                <span class="icon">⛷️</span>
            </div>
            <div class="node">
                <span class="node-label">End</span>
                <span class="node-lift">{routeRecord.endHeisTur.heis}</span>
                <span class="node-time"
                    >{formatDate(routeRecord.endHeisTur.timeStart)}</span
                >
            </div>
        </div>

        <section class="selection">
            <div class="selection-header">
                <h4>Correct Route</h4>
                <p>Select the slopes you actually skied</p>
            </div>

            <div class="options-list">
                {#each possibleRoutes as route}
                    <button
                        class="option-card"
                        class:selected={isCurrentRoute(route)}
                        onclick={() => updateRoute(route)}
                        disabled={isUpdating || isCurrentRoute(route)}
                    >
                        <div class="path-display">
                            {#each route as slope, i}
                                <span class="slope-name">{slope}</span>
                                {#if i < route.length - 1}
                                    <span class="path-arrow">→</span>
                                {/if}
                            {/each}
                        </div>
                        {#if isCurrentRoute(route)}
                            <span class="current-badge">Current</span>
                        {/if}
                    </button>
                {/each}

                {#if possibleRoutes.length === 0}
                    <div class="empty-msg">
                        No alternative routes available.
                    </div>
                {/if}
            </div>
        </section>

        {#if error}
            <div class="error-msg">{error}</div>
        {/if}

        {#if isUpdating}
            <div class="loading-overlay">
                <div class="spinner"></div>
            </div>
        {/if}
    </div>
</div>

<style>
    .overlay {
        position: fixed;
        inset: 0;
        background: rgba(10, 15, 30, 0.85);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: var(--spacing-md);
    }

    .modal {
        position: relative;
        max-width: 480px;
        width: 100%;
        margin: 0;
        padding: var(--spacing-lg);
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-lg);
        flex-shrink: 0;
    }

    .modal-header h3 {
        font-size: 1.5rem;
        font-weight: 800;
    }

    .close-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--glass-border);
        color: var(--text-muted);
        width: 36px;
        height: 36px;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        cursor: pointer;
        transition: all var(--transition-fast);
    }

    .close-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-main);
    }

    /* Timeline Styling */
    .timeline {
        display: flex;
        align-items: center;
        padding: var(--spacing-md);
        background: rgba(0, 0, 0, 0.2);
        border-radius: var(--radius-md);
        margin-bottom: var(--spacing-lg);
        flex-shrink: 0;
    }

    .node {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        min-width: 60px;
    }

    .node-label {
        font-size: 0.65rem;
        font-weight: 800;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .node-lift {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--accent-primary);
    }

    .node-time {
        font-size: 0.8rem;
        color: var(--text-main);
    }

    .connector {
        flex: 1;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 var(--spacing-sm);
    }

    .line {
        position: absolute;
        inset: 0;
        margin: auto;
        height: 2px;
        background: linear-gradient(
            90deg,
            var(--accent-primary),
            var(--accent-secondary)
        );
        opacity: 0.3;
    }

    .icon {
        background: var(--bg-main);
        padding: 4px;
        border-radius: var(--radius-full);
        font-size: 1rem;
        position: relative;
        z-index: 1;
    }

    /* Selection Area */
    .selection {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .selection-header {
        margin-bottom: var(--spacing-md);
    }

    .selection h4 {
        font-size: 1.1rem;
        margin-bottom: 2px;
    }

    .selection p {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin: 0;
    }

    .options-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        overflow-y: auto;
        padding-right: 4px;
        margin-bottom: var(--spacing-sm);
    }

    .option-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: all var(--transition-fast);
        text-align: left;
    }

    @media (hover: hover) {
        .option-card:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.06);
            border-color: var(--accent-primary);
        }
    }

    .option-card.selected {
        background: var(--accent-soft);
        border-color: var(--accent-primary);
        cursor: default;
    }

    .path-display {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex-wrap: wrap;
    }

    .slope-name {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-main);
    }

    .path-arrow {
        color: var(--text-dim);
        font-size: 0.8rem;
    }

    .current-badge {
        font-size: 0.65rem;
        font-weight: 800;
        text-transform: uppercase;
        color: var(--accent-primary);
        background: var(--accent-soft);
        padding: 2px 6px;
        border-radius: 4px;
    }

    .empty-msg {
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--text-dim);
        font-style: italic;
    }

    .error-msg {
        color: var(--error);
        font-size: 0.85rem;
        margin-top: var(--spacing-md);
        text-align: center;
    }

    .loading-overlay {
        position: absolute;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
    }
</style>
