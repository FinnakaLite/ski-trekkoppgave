<script lang="ts">
  let { API_BASE_URL }: { API_BASE_URL: string } = $props();
  let serialInput = $state("");

  async function verifyAndSave() {
    const verified = await fetch(
      `${API_BASE_URL}/verifyCardSerial?cardSerial=${serialInput.trim()}`,
    ).then((res) => res.ok);

    if (verified) {
      localStorage.setItem("cardSerial", serialInput.trim());
      // Simple reload approach to redirect the user back to the home view
      window.location.href = "/";
    } else {
      alert(
        "Invalid Card Serial Number. Please make sure your card number is correct. Make sure you have activated your card by going on your first lift ride.",
      );
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      verifyAndSave();
    }
  }
</script>

<div class="scan-page-wrapper">
  <div class="card">
    <div class="icon-container">⛷️</div>
    <h2>Scan Your Ski Pass</h2>
    <p class="subtitle">
      Please enter your card's serial number to access your data.
    </p>

    <div class="input-group">
      <input
        type="text"
        bind:value={serialInput}
        placeholder="e.g. CARD-XYZ123"
        onkeydown={handleKeydown}
        autofocus
      />
    </div>

    <button
      onclick={verifyAndSave}
      class="primary-btn"
      disabled={!serialInput.trim()}
    >
      <span class="btn-text">Connect Pass</span>
      <div class="btn-glow"></div>
    </button>
  </div>
</div>

<style>
  .scan-page-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 1rem;
    box-sizing: border-box;
  }

  .card {
    background: rgba(30, 41, 59, 0.7);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 25px 50px -12px rgba(0, 0, 0, 0.5),
      inset 0 1px 1px rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    padding: 3.5rem 2.5rem;
    text-align: center;
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    width: 100%;
    max-width: 440px;
  }

  .card:hover {
    transform: translateY(-5px);
    box-shadow:
      0 30px 60px -12px rgba(0, 0, 0, 0.6),
      inset 0 1px 1px rgba(255, 255, 255, 0.1);
  }

  .icon-container {
    font-size: 3.5rem;
    line-height: 1;
    margin-bottom: 1.5rem;
    animation: float 6s ease-in-out infinite;
  }

  h2 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: #f8fafc;
    letter-spacing: -0.025em;
  }

  .subtitle {
    color: #94a3b8;
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 2rem;
  }

  .input-group {
    margin-bottom: 2rem;
    position: relative;
  }

  input {
    width: 100%;
    box-sizing: border-box;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(148, 163, 184, 0.2);
    padding: 1.25rem 1.5rem;
    font-size: 1.125rem;
    color: #f8fafc;
    border-radius: 16px;
    outline: none;
    transition: all 0.3s ease;
    font-family: inherit;
    text-align: center;
    letter-spacing: 0.1em;
  }

  input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
    background: rgba(15, 23, 42, 0.8);
  }

  input::placeholder {
    color: #64748b;
    letter-spacing: normal;
  }

  .primary-btn {
    position: relative;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    color: white;
    border: none;
    padding: 1.25rem 2rem;
    font-size: 1.125rem;
    font-weight: 600;
    border-radius: 16px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    width: 100%;
    outline: none;
  }

  .primary-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #334155;
    transform: none;
    box-shadow: none;
  }

  .primary-btn:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.6);
  }

  .primary-btn:not(:disabled):active {
    transform: translateY(1px);
  }

  .btn-text {
    position: relative;
    z-index: 2;
  }

  .btn-glow {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: none;
    z-index: 1;
  }

  .primary-btn:not(:disabled):hover .btn-glow {
    animation: sweep 1s ease-in-out;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0) rotate(0);
    }
    50% {
      transform: translateY(-8px) rotate(4deg);
    }
  }

  @keyframes sweep {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }
</style>
