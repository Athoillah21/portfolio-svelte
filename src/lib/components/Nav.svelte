<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    let { user = null }: { user: { id: number; username: string } | null } =
        $props();

    let mobileMenuOpen = $state(false);

    function toggleMenu() {
        mobileMenuOpen = !mobileMenuOpen;
    }

    function isActive(path: string): boolean {
        const currentPath = $page.url.pathname;
        if (path === "/") return currentPath === "/";
        return currentPath.startsWith(path);
    }

    async function logout() {
        await fetch("/api/auth", { method: "DELETE" });
        window.location.href = "/";
    }
</script>

<nav
    class="container mx-auto px-4 sm:px-6 py-4 sm:py-6 sticky top-0 bg-black/90 backdrop-blur-md z-20"
>
    <div class="flex items-center justify-between w-full">
        <!-- Logo -->
        <a href="/" class="flex items-center gap-3 group no-underline">
            <div class="relative">
                <div
                    class="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style="background: conic-gradient(from 0deg, transparent, rgba(168, 85, 247, 0.6), rgba(236, 72, 153, 0.4), transparent 60%); animation: spin 3s linear infinite;"
                ></div>
                <div
                    class="relative z-10 transition-transform duration-300 group-hover:scale-110"
                >
                    <svg
                        class="h-6 w-6 sm:h-7 sm:w-7 text-purple-500"
                        style="filter: drop-shadow(0 0 8px rgba(168,85,247,0.5));"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                        />
                    </svg>
                </div>
            </div>
            <span
                class="text-base sm:text-lg tracking-tight text-white group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:via-pink-400 group-hover:to-red-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300"
            >
                Athoillah
            </span>
        </a>

        <!-- Desktop Nav -->
        <div
            class="hidden md:flex items-center space-x-8 lg:space-x-10 text-sm text-gray-400"
        >
            <a
                href="/about"
                class="hover:text-white transition-colors no-underline {isActive(
                    '/about',
                )
                    ? 'text-white'
                    : 'text-gray-400'}">About</a
            >
            <a
                href="/projects"
                class="hover:text-white transition-colors no-underline {isActive(
                    '/projects',
                )
                    ? 'text-white'
                    : 'text-gray-400'}">Projects</a
            >
            {#if user}
                <a
                    href="/notes"
                    class="hover:text-white transition-colors no-underline {isActive(
                        '/notes',
                    )
                        ? 'text-white'
                        : 'text-gray-400'}">Notes</a
                >
            {/if}
            <a
                href="/clients"
                class="hover:text-white transition-colors no-underline {isActive(
                    '/clients',
                )
                    ? 'text-white'
                    : 'text-gray-400'}">Clients</a
            >
            <a
                href="/contact"
                class="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-full transition-colors no-underline"
                >Contact</a
            >

            {#if user}
                <!-- Admin indicator + logout -->
                <div
                    class="flex items-center gap-3 ml-2 pl-4 border-l"
                    style="border-color: rgba(255,255,255,0.15);"
                >
                    <span
                        class="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                        style="background: rgba(34,197,94,0.2); color: #4ade80;"
                    >
                        <span class="material-symbols-outlined text-xs"
                            >admin_panel_settings</span
                        >
                        {user.username}
                    </span>
                    <button
                        onclick={logout}
                        class="text-gray-500 hover:text-red-400 transition-colors text-xs"
                        title="Logout"
                    >
                        <span class="material-symbols-outlined text-sm"
                            >logout</span
                        >
                    </button>
                </div>
            {:else}
                <a
                    href="/login"
                    class="text-gray-500 hover:text-gray-300 transition-colors no-underline ml-2"
                    title="Admin Login"
                >
                    <span class="material-symbols-outlined text-sm">lock</span>
                </a>
            {/if}
        </div>

        <!-- Mobile Menu Button -->
        <button
            onclick={toggleMenu}
            class="md:hidden text-gray-400 hover:text-white p-2"
        >
            <span class="material-symbols-outlined"
                >{mobileMenuOpen ? "close" : "menu"}</span
            >
        </button>
    </div>

    <!-- Mobile Menu -->
    {#if mobileMenuOpen}
        <div class="flex flex-col gap-2 pt-4 md:hidden">
            <a
                href="/about"
                class="text-gray-400 hover:text-white py-2 px-2 rounded transition-colors no-underline"
                >About</a
            >
            <a
                href="/projects"
                class="text-gray-400 hover:text-white py-2 px-2 rounded transition-colors no-underline"
                >Projects</a
            >
            {#if user}
                <a
                    href="/notes"
                    class="text-gray-400 hover:text-white py-2 px-2 rounded transition-colors no-underline"
                    >Notes</a
                >
            {/if}
            <a
                href="/clients"
                class="text-gray-400 hover:text-white py-2 px-2 rounded transition-colors no-underline"
                >Clients</a
            >
            <a
                href="/contact"
                class="text-gray-400 hover:text-white py-2 px-2 rounded transition-colors no-underline"
                >Contact</a
            >

            {#if user}
                <div
                    class="flex items-center justify-between mt-2 pt-2 border-t"
                    style="border-color: rgba(255,255,255,0.1);"
                >
                    <span
                        class="text-xs px-2 py-1 rounded-full"
                        style="background: rgba(34,197,94,0.2); color: #4ade80;"
                    >
                        Admin: {user.username}
                    </span>
                    <button
                        onclick={logout}
                        class="text-red-400 text-sm px-3 py-1 rounded"
                        >Logout</button
                    >
                </div>
            {:else}
                <a
                    href="/login"
                    class="text-gray-500 hover:text-gray-300 py-2 px-2 rounded transition-colors no-underline text-sm"
                >
                    <span
                        class="material-symbols-outlined text-sm align-middle mr-1"
                        >lock</span
                    > Admin Login
                </a>
            {/if}
        </div>
    {/if}
</nav>
