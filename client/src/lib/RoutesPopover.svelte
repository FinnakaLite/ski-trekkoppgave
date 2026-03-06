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

    // Helper to check if a route is currently selected
    const isCurrentRoute = (route: Bakker[]) => {
        return JSON.stringify(route) === JSON.stringify(routeRecord.route);
    };
</script>

<div class="popover-overlay" onclick={onClose} aria-hidden="true">
    <div
        class="popover-content card-glass"
        onclick={(e) => e.stopPropagation()}
        aria-hidden="true"
    >
        <header class="popover-header">
            <h3>Trip Details #{routeRecord.turID}</h3>
            <button class="close-btn" onclick={onClose}>&times;</button>
        </header>

        <div class="lift-details">
            <div class="lift-node">
                <span class="node-label">Start Lift</span>
                <span class="node-value"
                    >⛷️ {routeRecord.startHeisTur.heis}</span
                >
                <span class="node-time"
                    >{formatDate(routeRecord.startHeisTur.timeStart)}</span
                >
            </div>
            <div class="lift-connector"></div>
            <div class="lift-node">
                <span class="node-label">End Lift</span>
                <span class="node-value">⛳ {routeRecord.endHeisTur.heis}</span>
                <span class="node-time"
                    >{formatDate(routeRecord.endHeisTur.timeStart)}</span
                >
            </div>
        </div>

        <div class="route-selection">
            <h4>Select Route</h4>
            <p class="subtitle">
                Pick a valid sequence of slopes taken between these lifts
            </p>

            <div class="routes-options">
                {#each possibleRoutes as route, i}
                    <button
                        class="route-option"
                        class:selected={isCurrentRoute(route)}
                        onclick={() => updateRoute(route)}
                        disabled={isUpdating || isCurrentRoute(route)}
                    >
                        <div class="option-path">
                            {#each route as slope, j}
                                <span class="slope-tag">{slope}</span>
                                {#if j < route.length - 1}<span class="arrow"
                                        >→</span
                                    >{/if}
                            {/each}
                        </div>
                        {#if isCurrentRoute(route)}
                            <span class="current-label">Current</span>
                        {/if}
                    </button>
                {/each}

                {#if possibleRoutes.length === 0}
                    <p class="no-options">
                        No alternative routes found in map.
                    </p>
                {/if}
            </div>
        </div>

        {#if error}
            <p class="error-text">{error}</p>
        {/if}

        {#if isUpdating}
            <div class="updating-overlay">
                <div class="spinner"></div>
            </div>
        {/if}
    </div>
</div>

<style>
    .popover-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.8);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }

    .popover-content {
        position: relative;
        max-width: 500px;
        margin: 0;
        padding: 2rem;
        cursor: default;
    }

    .popover-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    .popover-header h3 {
        margin: 0;
        color: #f8fafc;
    }

    .close-btn {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
        line-height: 1;
    }

    .close-btn:hover {
        color: #f8fafc;
    }

    .lift-details {
        display: flex;
        align-items: center;
        justify-content: space-around;
        background: rgba(0, 0, 0, 0.2);
        padding: 1.5rem;
        border-radius: 12px;
        margin-bottom: 2rem;
    }

    .lift-node {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
    }

    .node-label {
        font-size: 0.75rem;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .node-value {
        font-weight: 700;
        color: #60a5fa;
        font-size: 1.25rem;
    }

    .node-time {
        font-size: 0.85rem;
        color: #f8fafc;
    }

    .lift-connector {
        flex: 1;
        height: 2px;
        background: linear-gradient(90deg, #60a5fa, #a78bfa);
        margin: 0 1rem;
        opacity: 0.3;
    }

    .route-selection h4 {
        margin: 0 0 0.5rem 0;
        color: #f8fafc;
    }

    .subtitle {
        font-size: 0.85rem;
        color: #94a3b8;
        margin-bottom: 1.5rem;
    }

    .routes-options {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .route-option {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: all 0.2s;
        width: 100%;
        text-align: left;
    }

    .route-option:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.06);
        border-color: #60a5fa;
    }

    .route-option.selected {
        background: rgba(96, 165, 250, 0.1);
        border-color: #60a5fa;
        cursor: default;
    }

    .option-path {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        flex-wrap: wrap;
    }

    .slope-tag {
        font-size: 0.75rem;
        background: rgba(148, 163, 184, 0.1);
        color: #e2e8f0;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
    }

    .arrow {
        color: #64748b;
        font-size: 0.8rem;
    }

    .current-label {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        color: #60a5fa;
    }

    .no-options {
        text-align: center;
        padding: 2rem;
        color: #64748b;
        font-style: italic;
    }

    .updating-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 16px;
    }
</style>
