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
            if (!response.ok) {
                throw new Error("Failed to fetch routes");
            }
            const data: RouteRecord[] = await response.json();

            // Sort by timeFirstLift descending and take 20
            routes = data
                .sort(
                    (a, b) =>
                        new Date(b.timeFirstLift).getTime() -
                        new Date(a.timeFirstLift).getTime(),
                )
                .slice(0, 20);
        } catch (err) {
            error = err instanceof Error ? err.message : "An error occurred";
            console.error(err);
        } finally {
            isLoading = false;
        }
    };

    onMount(() => {
        fetchRoutes();
    });

    // Re-fetch if cardSerial changes
    $effect(() => {
        if (cardSerial) {
            fetchRoutes();
        }
    });

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString("no-NO", {
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

    const openDetails = (route: RouteRecord) => {
        selectedRoute = route;
    };

    const closePopover = () => {
        selectedRoute = null;
    };
</script>

<div class="card-glass">
    <h2 class="section-title">Recent Routes</h2>

    {#if isLoading}
        <div class="state-container">
            <div class="spinner"></div>
            <p>Fetching your routes...</p>
        </div>
    {:else if error}
        <div class="state-container">
            <p class="error-text">{error}</p>
            <button class="retry-btn" onclick={fetchRoutes}>Try Again</button>
        </div>
    {:else if routes.length === 0}
        <div class="state-container">
            <p>No routes found yet.</p>
        </div>
    {:else}
        <ul class="item-list">
            {#each routes as routeRecord (routeRecord.turID)}
                <li
                    class="list-item clickable"
                    onclick={() => openDetails(routeRecord)}
                    aria-hidden="true"
                >
                    <div class="item-info">
                        <span class="info-primary"
                            >🏔️ Trip #{routeRecord.turID}</span
                        >
                        <span class="info-secondary">
                            {formatDate(routeRecord.timeFirstLift)} • {getDuration(
                                routeRecord.timeFirstLift,
                                routeRecord.timeEndLift,
                            )}
                        </span>
                        {#if routeRecord.route && routeRecord.route.length > 0}
                            <div class="route-slopes">
                                {#each routeRecord.route.slice(0, 5) as slope}
                                    <span class="slope-tag">{slope}</span>
                                {/each}
                                {#if routeRecord.route.length > 5}
                                    <span class="slope-more"
                                        >+{routeRecord.route.length - 5} more</span
                                    >
                                {/if}
                            </div>
                        {/if}
                    </div>
                    <div class="item-meta">
                        <span class="badge"
                            >{routeRecord.route.length} Slopes</span
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
        onClose={closePopover}
        onUpdate={fetchRoutes}
    />
{/if}

<style>
    .clickable {
        cursor: pointer;
    }

    .clickable:hover {
        background: rgba(255, 255, 255, 0.08);
    }

    .route-slopes {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        margin-top: 0.5rem;
    }

    .slope-tag {
        font-size: 0.7rem;
        background: rgba(96, 165, 250, 0.1);
        color: #60a5fa;
        padding: 0.1rem 0.4rem;
        border-radius: 4px;
        border: 1px solid rgba(96, 165, 250, 0.2);
    }

    .slope-more {
        font-size: 0.7rem;
        color: #94a3b8;
        align-self: center;
    }
</style>
