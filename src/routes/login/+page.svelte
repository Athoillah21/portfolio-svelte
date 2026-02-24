<script lang="ts">
    import { goto } from "$app/navigation";

    let username = $state("");
    let password = $state("");
    let error = $state("");
    let loading = $state(false);

    async function handleLogin(e: Event) {
        e.preventDefault();
        loading = true;
        error = "";

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                window.location.href = "/";
            } else {
                const data = await res.json();
                error = data.error || "Login failed";
            }
        } catch (err) {
            error = "Network error. Please try again.";
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>Admin Login - Athoillah's Portfolio</title>
</svelte:head>

<div
    class="flex items-center justify-center px-4"
    style="min-height: calc(100vh - 200px);"
>
    <div class="w-full max-w-sm">
        <div class="glass-card">
            <!-- Icon -->
            <div class="flex justify-center mb-6">
                <div
                    class="w-16 h-16 rounded-full flex items-center justify-center"
                    style="background: rgba(147,51,234,0.2); border: 1px solid rgba(147,51,234,0.3);"
                >
                    <span
                        class="material-symbols-outlined text-3xl text-purple-400"
                        >admin_panel_settings</span
                    >
                </div>
            </div>

            <h2 class="text-xl font-semibold text-white text-center mb-2">
                Admin Login
            </h2>
            <p class="text-gray-400 text-center text-sm mb-8">
                Sign in to manage your portfolio
            </p>

            <form onsubmit={handleLogin}>
                <div class="mb-5">
                    <label
                        for="username"
                        class="block text-sm font-medium text-gray-300 mb-2"
                        >Username</label
                    >
                    <input
                        type="text"
                        id="username"
                        bind:value={username}
                        required
                        autocomplete="username"
                        class="w-full px-4 py-3 rounded-lg text-white outline-none transition-all"
                        style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
                        placeholder="Enter username"
                    />
                </div>
                <div class="mb-6">
                    <label
                        for="password"
                        class="block text-sm font-medium text-gray-300 mb-2"
                        >Password</label
                    >
                    <input
                        type="password"
                        id="password"
                        bind:value={password}
                        required
                        autocomplete="current-password"
                        class="w-full px-4 py-3 rounded-lg text-white outline-none transition-all"
                        style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
                        placeholder="Enter password"
                    />
                </div>

                {#if error}
                    <div
                        class="mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                        style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5;"
                    >
                        <span class="material-symbols-outlined text-sm"
                            >error</span
                        >
                        {error}
                    </div>
                {/if}

                <button
                    type="submit"
                    class="shiny-cta"
                    style="width: 100%;"
                    disabled={loading}
                >
                    <span class="flex items-center justify-center">
                        {#if loading}
                            <span
                                class="material-symbols-outlined mr-2 animate-spin"
                                >progress_activity</span
                            >
                            Signing in...
                        {:else}
                            <span class="material-symbols-outlined mr-2"
                                >login</span
                            >
                            Sign In
                        {/if}
                    </span>
                </button>
            </form>
        </div>

        <p class="text-center text-gray-600 text-xs mt-6">
            <a
                href="/"
                class="hover:text-gray-400 transition-colors no-underline text-gray-600"
                >← Back to Portfolio</a
            >
        </p>
    </div>
</div>
