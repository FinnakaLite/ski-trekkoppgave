<script lang="ts">
  import { onMount } from "svelte";
  import ScanCard from "./pages/ScanCard.svelte";
  import RecentRides from "./lib/RecentRides.svelte";
  import RecentRoutes from "./lib/RecentRoutes.svelte";

  const API_BASE_URL = "http://localhost:3000/api";

  let currentPath = $state(window.location.pathname);
  let cardSerial = $state<string | null>(null);

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
  <main class="dashboard-container">
    <h1>Welcome to the Ski Tracker</h1>
    <p>Your Card Serial: {cardSerial}</p>

    {#if cardSerial}
      <RecentRides {cardSerial} {API_BASE_URL} />
    {/if}

    {#if cardSerial}
      <RecentRoutes {cardSerial} {API_BASE_URL} />
    {/if}

    <div class="actions">
      <button
        class="danger-btn"
        onclick={() => {
          localStorage.removeItem("cardSerial");
          window.location.href = "/scanCard";
        }}
      >
        Clear Card and Retry
      </button>
    </div>
  </main>
{/if}

<style>
  .dashboard-container {
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(to right, #60a5fa, #a78bfa);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: #94a3b8;
    font-size: 1.25rem;
    margin: 0;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
    align-items: start;
  }

  @media (max-width: 640px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }

    .dashboard-container {
      padding: 2rem 1rem;
    }
  }

  .actions {
    margin-top: 4rem;
    text-align: center;
  }

  .danger-btn {
    background: rgba(220, 38, 38, 0.2);
    color: #fca5a5;
    border: 1px solid rgba(220, 38, 38, 0.4);
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .danger-btn:hover {
    background: rgba(220, 38, 38, 0.4);
    transform: translateY(-2px);
  }
</style>
