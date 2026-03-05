<script lang="ts">
  import { onMount } from "svelte";
  import ScanCard from "./pages/ScanCard.svelte";

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

    <button
      class="danger-btn"
      onclick={() => {
        localStorage.removeItem("cardSerial");
        window.location.href = "/scanCard";
      }}
    >
      Clear Card and Retry
    </button>
  </main>
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family:
      "Inter",
      system-ui,
      -apple-system,
      sans-serif;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    color: #f8fafc;
    min-height: 100vh;
  }

  .dashboard-container {
    padding: 4rem 2rem;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(to right, #60a5fa, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: #94a3b8;
    font-size: 1.25rem;
    margin-bottom: 3rem;
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
