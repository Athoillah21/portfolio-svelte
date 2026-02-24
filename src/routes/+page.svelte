<script lang="ts">
    import { page } from "$app/stores";
    import AdminModal from "$lib/components/AdminModal.svelte";
    import Toast from "$lib/components/Toast.svelte";

    let { data } = $props();
    const user = $derived($page.data.user);

    let fullName = $state(data.hero.fullName);
    let role = $state(data.hero.role);
    let company = $state(data.hero.company);

    // Edit modal state
    let showModal = $state(false);
    let editName = $state("");
    let editRole = $state("");
    let editCompany = $state("");
    let saving = $state(false);

    // Toast
    let toastMsg = $state("");
    let toastType = $state<"success" | "error">("success");
    let toastKey = $state(0);

    function toast(msg: string, type: "success" | "error" = "success") {
        toastMsg = msg;
        toastType = type;
        toastKey++;
    }

    function openEdit() {
        editName = fullName;
        editRole = role;
        editCompany = company;
        showModal = true;
    }

    async function saveHero() {
        saving = true;
        try {
            const res = await fetch("/api/hero", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: editName.trim(),
                    role: editRole.trim(),
                    company: editCompany.trim(),
                }),
            });
            if (res.ok) {
                fullName = editName.trim();
                role = editRole.trim();
                company = editCompany.trim();
                showModal = false;
                toast("Hero updated!");
            } else {
                toast("Failed to save", "error");
            }
        } catch {
            toast("Network error", "error");
        } finally {
            saving = false;
        }
    }
</script>

{#if toastMsg}
    {#key toastKey}
        <Toast message={toastMsg} type={toastType} />
    {/key}
{/if}

<svelte:head>
    <title>{fullName}'s Portfolio</title>
</svelte:head>

<!-- Hero Section -->
<div
    class="home-hero flex-1 flex items-center justify-center relative px-4"
    style="min-height: calc(100vh - 200px);"
>
    <div class="hero-glow"></div>

    <div class="container mx-auto text-center relative z-10 max-w-3xl">
        <div class="glass-card">
            <!-- Name -->
            <h1
                class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-5 sm:mb-6 fade-in leading-tight"
            >
                <span
                    class="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-red-400"
                >
                    {fullName}
                </span>
            </h1>

            <!-- Role -->
            <p
                class="text-gray-300 text-base sm:text-lg md:text-xl mb-3 fade-in fade-in-delay-1 leading-relaxed"
            >
                <span
                    class="font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400"
                >
                    {role}
                </span>
                at {company}
            </p>

            <!-- Admin Edit Button -->
            {#if user}
                <button
                    onclick={openEdit}
                    class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all opacity-60 hover:opacity-100"
                    style="background: rgba(147,51,234,0.2); border: 1px solid rgba(147,51,234,0.3); color: #c084fc;"
                >
                    <span class="material-symbols-outlined text-sm">edit</span>
                    Edit Hero
                </button>
            {/if}
        </div>
    </div>
</div>

<!-- Explore Section -->
<div class="pb-10 sm:pb-14 flex justify-center">
    <a href="/about" class="scroll-indicator">
        <div class="icon-wrap">
            <span class="material-symbols-outlined arrow">expand_more</span>
        </div>
        <span class="explore-title">Explore More</span>
    </a>
</div>

<!-- Edit Hero Modal -->
<AdminModal
    show={showModal}
    title="Edit Landing Page"
    onclose={() => (showModal = false)}
>
    <div class="space-y-5">
        <div>
            <label
                for="hero-name"
                class="block text-sm font-medium text-gray-300 mb-2"
                >Full Name</label
            >
            <input
                type="text"
                id="hero-name"
                bind:value={editName}
                placeholder="Your full name"
                class="w-full px-4 py-3 rounded-lg text-white outline-none"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            />
        </div>
        <div>
            <label
                for="hero-role"
                class="block text-sm font-medium text-gray-300 mb-2"
                >Role / Title</label
            >
            <input
                type="text"
                id="hero-role"
                bind:value={editRole}
                placeholder="e.g. Database Administrator"
                class="w-full px-4 py-3 rounded-lg text-white outline-none"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            />
        </div>
        <div>
            <label
                for="hero-company"
                class="block text-sm font-medium text-gray-300 mb-2"
                >Company</label
            >
            <input
                type="text"
                id="hero-company"
                bind:value={editCompany}
                placeholder="e.g. Telkomsigma"
                class="w-full px-4 py-3 rounded-lg text-white outline-none"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            />
        </div>
        <div class="flex gap-3 pt-2">
            <button
                onclick={saveHero}
                disabled={saving}
                class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors disabled:opacity-50"
            >
                {#if saving}
                    <span class="material-symbols-outlined text-sm animate-spin"
                        >progress_activity</span
                    >
                    Saving...
                {:else}
                    <span class="material-symbols-outlined text-sm">save</span>
                    Save Changes
                {/if}
            </button>
            <button
                onclick={() => (showModal = false)}
                class="px-4 py-3 rounded-lg text-gray-400 hover:text-white transition-colors"
                style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);"
            >
                Cancel
            </button>
        </div>
    </div>
</AdminModal>
