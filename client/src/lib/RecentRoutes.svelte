<script lang="ts">
    import { onMount } from "svelte";
    import RoutesPopover from "./RoutesPopover.svelte";
    import type { Bakker, Heiser } from "./routesMap";

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
        cardSerial,
        API_BASE_URL,
    }: { cardSerial: string; API_BASE_URL: string } = $props();

    let routes = $state<RouteRecord[]>([]);
    let isLoading = $state(true);
    let error = $state<string | null>(null);
    let selectedRoute = $state<RouteRecord | null>(null);

    const fetchRoutes = async () => {
        if (!cardSerial) return;
        isLoading = true;
        error = null;
        try {
            const response = await fetch(
                `${API_BASE_URL}/routes?cardSerial=${cardSerial}`,
            );
            if (!response.ok) throw new Error("Failed to fetch routes");
            const data: RouteRecord[] = await response.json();

            routes = data
                .sort(
                    (a, b) =>
                        new Date(b.timeFirstLift).getTime() -
                        new Date(a.timeFirstLift).getTime(),
                )
                .slice(0, 20);
        } catch (err) {
            error = err instanceof Error ? err.message : "Error loading routes";
        } finally {
            isLoading = false;
        }
    };

    onMount(() => {
        fetchRoutes();
    });

    $effect(() => {
        if (cardSerial) fetchRoutes();
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("no-NO", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getDuration = (start: string, end: string) => {
        const diff = new Date(end).getTime() - new Date(start).getTime();
        const mins = Math.round(diff / 60000);
        return `${mins} min`;
    };
</script>

<div class="card-glass">
    <h2 class="section-title">
        <span class="title-icon">🏔️</span> Recent Trips
    </h2>

    {#if isLoading}
        <div class="state-container">
            <div class="spinner"></div>
            <p>Loading trips...</p>
        </div>
    {:else if error}
        <div class="state-container">
            <p class="error-text">{error}</p>
            <button class="retry-btn" onclick={fetchRoutes}>Retry</button>
        </div>
    {:else if routes.length === 0}
        <div class="state-container">
            <p>No trips recorded yet.</p>
        </div>
    {:else}
        <ul class="item-list">
            {#each routes as routeRecord (routeRecord.turID)}
                <li
                    class="list-item interactive"
                    onclick={() => (selectedRoute = routeRecord)}
                    aria-hidden="true"
                >
                    <div class="item-info">
                        <span class="info-primary"
                            >Trip #{routeRecord.turID}</span
                        >
                        <span class="info-secondary">
                            {formatDate(routeRecord.timeFirstLift)} • {getDuration(
                                routeRecord.timeFirstLift,
                                routeRecord.timeEndLift,
                            )}
                        </span>
                        {#if routeRecord.route && routeRecord.route.length > 0}
                            <div class="slope-line">
                                {#each routeRecord.route.slice(0, 4) as slope}
                                    <span class="slope-pill">{slope}</span>
                                {/each}
                                {#if routeRecord.route.length > 4}
                                    <span class="slope-more"
                                        >+{routeRecord.route.length - 4}</span
                                    >
                                {/if}
                            </div>
                        {/if}
                    </div>
                    <div class="item-meta">
                        <span class="badge count-badge"
                            >{routeRecord.route.length} slopes</span
                        >
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</div>

{#if selectedRoute}
    <RoutesPopover
        routeRecord={selectedRoute}
        {API_BASE_URL}
        onClose={() => (selectedRoute = null)}
        onUpdate={fetchRoutes}
    />
{/if}

<style>
    .title-icon {
        font-size: 1.1em;
    }

    .interactive {
        cursor: pointer;
    }

    .slope-line {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
    }

    .slope-pill {
        font-size: 0.65rem;
        font-weight: 700;
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-muted);
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .slope-more {
        font-size: 0.65rem;
        color: var(--text-dim);
        align-self: center;
        padding-left: 2px;
    }

    .count-badge {
        color: var(--accent-secondary);
        background: rgba(139, 92, 246, 0.1);
    }
</style>
