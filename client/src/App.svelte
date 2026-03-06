<script lang="ts">
  import { onMount } from "svelte";
  import ScanCard from "./pages/ScanCard.svelte";
  import RecentRides from "./lib/RecentRides.svelte";
  import RecentRoutes from "./lib/RecentRoutes.svelte";
  import SkiSummary from "./lib/SkiSummary.svelte";
  import SkiMapPopover from "./lib/SkiMapPopover.svelte";

  const API_BASE_URL = "http://localhost:3000/api";

  let currentPath = $state(window.location.pathname);
  let cardSerial = $state<string | null>(null);
  let showSkiMap = $state(false);

  onMount(() => {
    // Check local storage for the card serial
    cardSerial = localStorage.getItem("cardSerial");

    // Redirect logic
    if (!cardSerial && currentPath !== "/scanCard") {
      window.history.pushState({}, "", "/scanCard");
      currentPath = "/scanCard";
    }

    // Listen for path changes (popstate)
    const handlePopState = () => {
      currentPath = window.location.pathname;
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  });
</script>

{#if currentPath === "/scanCard"}
  <ScanCard {API_BASE_URL} />
{:else}
  <main class="dashboard-wrapper">
    <div class="container">
      <header class="main-header">
        <h1 class="gradient-text">Ski Tracker</h1>
        <div class="header-actions">
          {#if cardSerial}
            <div class="user-chip">
              <span class="chip-icon">🆔</span>
              <span class="chip-text">{cardSerial}</span>
            </div>
          {/if}
          <button class="map-btn" onclick={() => (showSkiMap = true)}>
            <span class="btn-icon">🗺️</span>
            <span class="btn-text">Map</span>
          </button>
        </div>
      </header>

      {#if showSkiMap}
        <SkiMapPopover
          onClose={() => {
            showSkiMap = false;
          }}
        />
      {/if}

      {#if cardSerial}
        <div class="content-sections">
          <section class="summary-section">
            <SkiSummary {cardSerial} {API_BASE_URL} />
          </section>

          <section class="data-lists">
            <RecentRides {cardSerial} {API_BASE_URL} />
            <RecentRoutes {cardSerial} {API_BASE_URL} />
          </section>
        </div>
      {/if}

      <footer class="main-footer">
        <button
          class="clear-btn"
          onclick={() => {
            localStorage.removeItem("cardSerial");
            window.location.href = "/scanCard";
          }}
        >
          Disconnect Card
        </button>
      </footer>
    </div>
  </main>
{/if}

<style>
  .dashboard-wrapper {
    padding-top: var(--spacing-xl);
    padding-bottom: var(--spacing-xl);
  }

  .main-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
    justify-content: center;
  }

  h1 {
    font-size: clamp(2rem, 8vw, 3rem);
    font-weight: 800;
    letter-spacing: -0.025em;
  }

  .user-chip,
  .map-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    background: rgba(255, 255, 255, 0.05);
    padding: 0.5rem 1rem;
    border-radius: var(--radius-full);
    border: 1px solid var(--glass-border);
    font-size: 0.9rem;
    cursor: default;
  }

  .user-chip {
    color: var(--text-muted);
  }

  .map-btn {
    background: var(--accent-soft);
    color: var(--accent-primary);
    border-color: rgba(59, 130, 246, 0.3);
    font-weight: 700;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .map-btn:hover {
    background: rgba(59, 130, 246, 0.2);
    transform: translateY(-2px);
  }

  .map-btn:active {
    transform: scale(0.95);
  }

  .content-sections {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .data-lists {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
    align-items: start;
  }

  @media (min-width: 1024px) {
    .data-lists {
      grid-template-columns: 1fr 1fr;
    }
  }

  .main-footer {
    margin-top: var(--spacing-xl);
    display: flex;
    justify-content: center;
  }

  .clear-btn {
    background: rgba(239, 68, 68, 0.1);
    color: var(--error);
    border: 1px solid rgba(239, 68, 68, 0.2);
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .clear-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    transform: translateY(-2px);
  }
</style>
