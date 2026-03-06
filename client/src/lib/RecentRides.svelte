<script lang="ts">
    import { onMount } from "svelte";

    interface Ride {
        heisTurid: number;
        cardSerial: string;
        timeStart: string;
        heis: string;
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
            if (!response.ok) {
                throw new Error("Failed to fetch rides");
            }
            const data: Ride[] = await response.json();

            // Sort by timeStart descending and take 20
            rides = data
                .sort(
                    (a, b) =>
                        new Date(b.timeStart).getTime() -
                        new Date(a.timeStart).getTime(),
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
        fetchRides();
    });

    // Re-fetch if cardSerial changes
    $effect(() => {
        if (cardSerial) {
            fetchRides();
        }
    });

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString("no-NO", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };
</script>

<div class="card-glass">
    <h2 class="section-title">Recent Rides</h2>

    {#if isLoading}
        <div class="state-container">
            <div class="spinner"></div>
            <p>Fetching your rides...</p>
        </div>
    {:else if error}
        <div class="state-container">
            <p class="error-text">{error}</p>
            <button class="retry-btn" onclick={fetchRides}>Try Again</button>
        </div>
    {:else if rides.length === 0}
        <div class="state-container">
            <p>No rides found for this card.</p>
        </div>
    {:else}
        <ul class="item-list">
            {#each rides as ride (ride.heisTurid)}
                <li class="list-item">
                    <div class="item-info">
                        <span class="info-primary">⛷️ Lift {ride.heis}</span>
                        <span class="info-secondary"
                            >{formatDate(ride.timeStart)}</span
                        >
                    </div>
                    <div class="item-meta">
                        <span class="badge">{ride.length}m</span>
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</div>
