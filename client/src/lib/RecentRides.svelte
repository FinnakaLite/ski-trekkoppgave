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

<div class="rides-card">
    <h2>Recent Rides</h2>

    {#if isLoading}
        <div class="loading">
            <div class="spinner"></div>
            <p>Fetching your rides...</p>
        </div>
    {:else if error}
        <div class="error-state">
            <p>{error}</p>
            <button onclick={fetchRides}>Try Again</button>
        </div>
    {:else if rides.length === 0}
        <div class="empty-state">
            <p>No rides found for this card.</p>
        </div>
    {:else}
        <ul class="rides-list">
            {#each rides as ride (ride.heisTurid)}
                <li class="ride-item">
                    <div class="ride-info">
                        <span class="ride-heis">⛷️ Lift {ride.heis}</span>
                        <span class="ride-time"
                            >{formatDate(ride.timeStart)}</span
                        >
                    </div>
                    <div class="ride-meta">
                        <span class="ride-length">{ride.length}m</span>
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .rides-card {
        background: rgba(30, 41, 59, 0.7);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        width: 100%;
        margin-top: 2rem;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
    }

    h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
        color: #f8fafc;
        font-weight: 600;
        text-align: left;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 0.75rem;
    }

    .rides-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .ride-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        transition: all 0.2s ease;
        border: 1px solid transparent;
    }

    .ride-item:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(96, 165, 250, 0.3);
        transform: translateX(4px);
    }

    .ride-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
    }

    .ride-heis {
        font-weight: 600;
        color: #60a5fa;
        font-size: 1rem;
    }

    .ride-time {
        font-size: 0.85rem;
        color: #94a3b8;
    }

    .ride-meta {
        text-align: right;
    }

    .ride-length {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
        font-size: 0.9rem;
        color: #a78bfa;
        background: rgba(167, 139, 250, 0.1);
        padding: 0.25rem 0.6rem;
        border-radius: 6px;
    }

    .loading,
    .empty-state,
    .error-state {
        padding: 3rem 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        color: #94a3b8;
    }

    .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid rgba(96, 165, 250, 0.2);
        border-top-color: #60a5fa;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .error-state p {
        color: #fca5a5;
        margin-bottom: 1rem;
    }

    .error-state button {
        background: #60a5fa;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
    }
</style>
