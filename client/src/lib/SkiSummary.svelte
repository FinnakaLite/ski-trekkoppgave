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

<div class="summary-container card-glass">
    <div class="summary-header">
        <h2 class="section-title">Ski Performance</h2>
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
    </div>

    {#if isLoading}
        <div class="state-container mini">
            <div class="spinner"></div>
        </div>
    {:else if error}
        <div class="state-container mini">
            <p class="error-text">{error}</p>
        </div>
    {:else}
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">🚠</div>
                <div class="stat-content">
                    <span class="stat-label">Total Lift Rides</span>
                    <span class="stat-value">{stats.totalTrips}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🏔️</div>
                <div class="stat-content">
                    <span class="stat-label">Elevation Gain</span>
                    <div class="stat-value-group">
                        <span class="stat-value">{stats.totalMeters}</span>
                        <span class="stat-unit">meters</span>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .summary-container {
        max-width: 1200px;
        margin-bottom: 2rem;
        padding: 2rem;
        margin-left: auto;
        margin-right: auto;
    }

    .summary-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .summary-header h2 {
        margin: 0;
        border: none;
        padding: 0;
    }

    .timeframe-selector {
        display: flex;
        background: rgba(15, 23, 42, 0.4);
        padding: 0.25rem;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .time-btn {
        background: transparent;
        border: none;
        color: #94a3b8;
        padding: 0.5rem 1.25rem;
        font-size: 0.85rem;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .time-btn:hover {
        color: #f8fafc;
    }

    .time-btn.active {
        background: #3b82f6;
        color: white;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1.5rem;
    }

    .stat-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1.25rem;
        transition:
            transform 0.2s,
            border-color 0.2s;
    }

    .stat-card:hover {
        transform: translateY(-2px);
        border-color: rgba(96, 165, 250, 0.3);
    }

    .stat-icon {
        font-size: 2rem;
        background: rgba(96, 165, 250, 0.1);
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
    }

    .stat-content {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .stat-label {
        font-size: 0.85rem;
        color: #94a3b8;
        font-weight: 500;
        letter-spacing: 0.02em;
    }

    .stat-value {
        font-size: 1.75rem;
        font-weight: 800;
        color: #f8fafc;
        line-height: 1;
    }

    .stat-value-group {
        display: flex;
        align-items: baseline;
        gap: 0.4rem;
    }

    .stat-unit {
        font-size: 0.9rem;
        color: #60a5fa;
        font-weight: 600;
    }

    .mini {
        padding: 1.5rem !important;
    }

    @media (max-width: 640px) {
        .summary-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .timeframe-selector {
            width: 100%;
            justify-content: space-between;
        }

        .time-btn {
            flex: 1;
            padding: 0.5rem 0.5rem;
        }
    }
</style>
