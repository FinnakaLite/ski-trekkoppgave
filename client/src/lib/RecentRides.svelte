<script lang="ts">
    import { onMount } from "svelte";
    import type { Heiser } from "./routesMap";

    interface Ride {
        heisTurid: number;
        cardSerial: string;
        timeStart: string;
        heis: Heiser;
        length: number;
    }

    let {
        cardSerial,
        API_BASE_URL,
    }: { cardSerial: string; API_BASE_URL: string } = $props();

    let rides = $state<Ride[]>([]);
    let isLoading = $state(true);
    let error = $state<string | null>(null);

    const fetchRides = async () => {
        if (!cardSerial) return;
        isLoading = true;
        error = null;
        try {
            const response = await fetch(
                `${API_BASE_URL}/lifts?cardSerial=${cardSerial}`,
            );
            if (!response.ok) throw new Error("Failed to fetch rides");
            const data: Ride[] = await response.json();

            rides = data
                .sort(
                    (a, b) =>
                        new Date(b.timeStart).getTime() -
                        new Date(a.timeStart).getTime(),
                )
                .slice(0, 20);
        } catch (err) {
            error = err instanceof Error ? err.message : "Error loading rides";
        } finally {
            isLoading = false;
        }
    };

    onMount(() => {
        fetchRides();
    });

    $effect(() => {
        if (cardSerial) fetchRides();
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("no-NO", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };
</script>

<div class="card-glass">
    <h2 class="section-title">
        <span class="title-icon">🚠</span> Recent Rides
    </h2>

    {#if isLoading}
        <div class="state-container">
            <div class="spinner"></div>
            <p>Loading rides...</p>
        </div>
    {:else if error}
        <div class="state-container">
            <p class="error-text">{error}</p>
            <button class="retry-btn" onclick={fetchRides}>Retry</button>
        </div>
    {:else if rides.length === 0}
        <div class="state-container">
            <p>No rides recorded yet.</p>
        </div>
    {:else}
        <ul class="item-list">
            {#each rides as ride (ride.heisTurid)}
                <li class="list-item">
                    <div class="item-info">
                        <span class="info-primary">Lift {ride.heis}</span>
                        <span class="info-secondary"
                            >{formatDate(ride.timeStart)}</span
                        >
                    </div>
                    <div class="item-meta">
                        <span class="badge elevation-badge">{ride.length}m</span
                        >
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .title-icon {
        font-size: 1.1em;
    }

    .elevation-badge {
        color: var(--accent-primary);
        background: rgba(59, 130, 246, 0.1);
    }
</style>
