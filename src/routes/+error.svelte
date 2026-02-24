<script lang="ts">
    import { page } from "$app/stores";
</script>

<svelte:head>
    <title>Error {$page.status} - Athoillah's Portfolio</title>
</svelte:head>

<div
    class="flex flex-col items-center justify-center px-4 text-center"
    style="min-height: calc(100vh - 200px);"
>
    <div
        class="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3);"
    >
        <span class="material-symbols-outlined text-4xl" style="color: #f87171;"
            >error</span
        >
    </div>

    <h1
        class="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-purple-400 mb-4"
    >
        {$page.status}
    </h1>

    <p class="text-gray-400 text-lg mb-8 max-w-md">
        {#if $page.status === 404}
            The page you're looking for doesn't exist or has been moved.
        {:else}
            Something went wrong. Please try again later.
        {/if}
    </p>

    <a
        href="/"
        class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors no-underline"
    >
        <span class="material-symbols-outlined text-sm">home</span>
        Back to Home
    </a>
</div>
