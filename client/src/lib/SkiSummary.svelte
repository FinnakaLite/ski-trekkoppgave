<script lang="ts">
    import { onMount } from "svelte";

    interface Ride {
        heisTurid: number;
        timeStart: string;
        heis: string;
        length: number;
    }

    let {
        cardSerial,
        API_BASE_URL,
    }: { cardSerial: string; API_BASE_URL: string } = $props();

    type Timeframe = "today" | "month" | "year" | "all";
    let timeframe = $state<Timeframe>("all");
    let rides = $state<Ride[]>([]);
    let isLoading = $state(true);
    let error = $state<string | null>(null);

    let stats = $derived({
        totalTrips: rides.length,
        totalMeters: rides.reduce((sum, ride) => sum + ride.length, 0),
    });

    const fetchStats = async () => {
        if (!cardSerial) return;
        isLoading = true;
        error = null;

        let dateFrom: string | null = null;
        const now = new Date();

        if (timeframe === "today") {
            const startOfDay = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
            );
            dateFrom = startOfDay.toISOString();
        } else if (timeframe === "month") {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFrom = startOfMonth.toISOString();
        } else if (timeframe === "year") {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            dateFrom = startOfYear.toISOString();
        }

        try {
            let url = `${API_BASE_URL}/lifts?cardSerial=${cardSerial}`;
            if (dateFrom) url += `&dateFrom=${dateFrom}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch stats");
            rides = await response.json();
        } catch (err) {
            error = err instanceof Error ? err.message : "Error fetching stats";
        } finally {
            isLoading = false;
        }
    };

    onMount(() => {
        fetchStats();
    });

    $effect(() => {
        if (cardSerial || timeframe) {
            fetchStats();
        }
    });
</script>

<div class="card-glass summary-card">
    <header class="summary-header">
        <h2 class="section-title">Performance</h2>
        <div class="timeframe-selector">
            {#each ["all", "today", "month", "year"] as option}
                <button
                    class="time-btn"
                    class:active={timeframe === option}
                    onclick={() => (timeframe = option as Timeframe)}
                >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
            {/each}
        </div>
    </header>

    {#if isLoading}
        <div class="state-container compact">
            <div class="spinner"></div>
        </div>
    {:else if error}
        <div class="state-container compact">
            <p class="error-text">{error}</p>
        </div>
    {:else}
        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-label">Lift Rides</span>
                <span class="stat-value">{stats.totalTrips}</span>
                <span class="stat-icon-bg">🚠</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Elevation</span>
                <div class="stat-value-group">
                    <span class="stat-value">{stats.totalMeters}</span>
                    <span class="stat-unit">m</span>
                </div>
                <span class="stat-icon-bg">🏔️</span>
            </div>
        </div>
    {/if}
</div>

<style>
    .summary-card {
        padding-top: var(--spacing-md);
    }

    .summary-header {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
    }

    @media (min-width: 640px) {
        .summary-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }
    }

    .section-title {
        margin-bottom: 0;
        border: none;
        padding-bottom: 0;
    }

    .timeframe-selector {
        display: flex;
        background: rgba(0, 0, 0, 0.2);
        padding: 3px;
        border-radius: var(--radius-md);
        width: 100%;
        max-width: 400px;
    }

    .time-btn {
        flex: 1;
        background: transparent;
        border: none;
        color: var(--text-muted);
        padding: 0.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all var(--transition-fast);
    }

    .time-btn.active {
        background: var(--accent-primary);
        color: white;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-md);
    }

    .stat-item {
        position: relative;
        background: rgba(255, 255, 255, 0.03);
        padding: var(--spacing-lg) var(--spacing-md);
        border-radius: var(--radius-md);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .stat-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        margin-bottom: 0.25rem;
        position: relative;
        z-index: 1;
    }

    .stat-value {
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--text-main);
        position: relative;
        z-index: 1;
        line-height: 1.1;
    }

    .stat-value-group {
        display: flex;
        align-items: baseline;
        gap: 0.25rem;
    }

    .stat-unit {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--accent-primary);
        position: relative;
        z-index: 1;
    }

    .stat-icon-bg {
        position: absolute;
        right: -10px;
        bottom: -10px;
        font-size: 4rem;
        opacity: 0.05;
        pointer-events: none;
        transform: rotate(-15deg);
    }

    .compact {
        padding: var(--spacing-md) !important;
    }
</style>
