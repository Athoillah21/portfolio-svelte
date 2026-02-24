<script lang="ts">
    import { page } from "$app/stores";
    import AdminModal from "$lib/components/AdminModal.svelte";
    import Toast from "$lib/components/Toast.svelte";
    import ConfirmModal from "$lib/components/ConfirmModal.svelte";

    let { data } = $props();
    const user = $derived($page.data.user);

    let clients = $state(data.clients);

    // Modal & Form State
    let showModal = $state(false);
    let editingClient = $state<any>(null);
    let formName = $state("");
    let formLogo = $state("");
    let formOrder = $state(0);
    let saving = $state(false);
    let showConfirm = $state(false);
    let pendingDelete = $state<any>(null);
    let deleting = $state(false);

    // Toast State
    let toastMsg = $state("");
    let toastType = $state<"success" | "error" | "info">("success");
    let toastVisible = $state(false);

    function toast(
        msg: string,
        type: "success" | "error" | "info" = "success",
    ) {
        toastMsg = msg;
        toastType = type;
        toastVisible = true;
        setTimeout(() => (toastVisible = false), 3000);
    }

    function openAddModal() {
        editingClient = null;
        formName = "";
        formLogo = "";
        formOrder = clients.length + 1;
        showModal = true;
    }

    function openEditModal(client: any) {
        editingClient = client;
        formName = client.name;
        formLogo = client.logoUrl;
        formOrder = client.sortOrder || 0;
        showModal = true;
    }

    async function saveClient() {
        if (!formName.trim() || !formLogo.trim()) {
            toast("Name and Logo URL are required", "error");
            return;
        }
        saving = true;

        const payload = {
            id: editingClient?.id,
            name: formName,
            logoUrl: formLogo,
            sortOrder: formOrder,
        };

        const method = editingClient ? "PUT" : "POST";

        try {
            const res = await fetch("/api/clients", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const result = await res.json();
                if (editingClient) {
                    const idx = clients.findIndex(
                        (c: any) => c.id === editingClient.id,
                    );
                    if (idx !== -1)
                        clients[idx] = { ...clients[idx], ...payload };
                    toast("Client updated");
                } else {
                    clients = [...clients, { ...payload, id: result.id }];
                    toast("Client added");
                }
                showModal = false;
            } else {
                toast("Failed to save", "error");
            }
        } catch (e) {
            toast("Network error", "error");
        } finally {
            saving = false;
        }
    }

    function requestDelete(client: any) {
        pendingDelete = client;
        showConfirm = true;
    }

    async function confirmDelete() {
        if (!pendingDelete) return;
        deleting = true;
        try {
            const res = await fetch(`/api/clients?id=${pendingDelete.id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                clients = clients.filter((c: any) => c.id !== pendingDelete.id);
                toast("Client deleted");
            } else {
                toast("Failed to delete", "error");
            }
        } catch (e) {
            toast("Network error", "error");
        } finally {
            deleting = false;
            showConfirm = false;
            pendingDelete = null;
        }
    }
</script>

<svelte:head>
    <title>Clients - Athoillah's Portfolio</title>
</svelte:head>

<Toast message={toastMsg} type={toastType} bind:visible={toastVisible} />

<div class="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
    <div class="flex items-center justify-center gap-4 mb-4 sm:mb-6">
        <h1
            class="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-purple-400"
        >
            Trusted Clients
        </h1>
        {#if user}
            <button
                onclick={openAddModal}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style="background: rgba(147,51,234,0.2); border: 1px solid rgba(147,51,234,0.3); color: #c084fc;"
                onmouseenter={(e) => {
                    e.currentTarget.style.background = "rgba(147,51,234,0.4)";
                }}
                onmouseleave={(e) => {
                    e.currentTarget.style.background = "rgba(147,51,234,0.2)";
                }}
            >
                <span class="material-symbols-outlined text-sm">add</span> Add Client
            </button>
        {/if}
    </div>

    <p
        class="text-gray-400 text-center max-w-2xl mx-auto mb-10 sm:mb-14 text-sm sm:text-base"
    >
        Companies that entrusted me for managing and optimizing their database
        systems.
    </p>

    <div class="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {#each clients as client}
            <div
                class="card-glass client-logo-card flex items-center justify-center h-40 hover:-translate-y-1 hover:scale-105 transition-all duration-300 relative group/card"
                data-glow
                style="--base: 240; --sat: 80;"
            >
                <!-- Admin Controls -->
                {#if user}
                    <div
                        class="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity"
                    >
                        <button
                            onclick={() => openEditModal(client)}
                            class="p-1.5 rounded-lg transition-all"
                            style="background: rgba(147,51,234,0.8); backdrop-filter: blur(8px); color: white;"
                            title="Edit"
                        >
                            <span class="material-symbols-outlined text-xs"
                                >edit</span
                            >
                        </button>
                        <button
                            onclick={() => requestDelete(client)}
                            class="p-1.5 rounded-lg transition-all"
                            style="background: rgba(239,68,68,0.8); backdrop-filter: blur(8px); color: white;"
                            title="Delete"
                        >
                            <span class="material-symbols-outlined text-xs"
                                >delete</span
                            >
                        </button>
                    </div>
                {/if}

                <img
                    src={client.logoUrl}
                    alt={client.name}
                    class="max-w-[80%] max-h-[80%] object-contain"
                />
            </div>
        {/each}
    </div>
</div>

<!-- Add/Edit Modal -->
<AdminModal
    show={showModal}
    title={editingClient ? "Edit Client" : "Add Client"}
    onclose={() => (showModal = false)}
>
    <div class="space-y-4">
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2"
                >Client Name</label
            >
            <input
                type="text"
                bind:value={formName}
                placeholder="e.g. Google"
                class="w-full px-4 py-3 rounded-lg text-white outline-none"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            />
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2"
                >Logo URL</label
            >
            <input
                type="text"
                bind:value={formLogo}
                placeholder="e.g. /images/google.svg"
                class="w-full px-4 py-3 rounded-lg text-white outline-none"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            />
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2"
                >Sort Order</label
            >
            <input
                type="number"
                bind:value={formOrder}
                class="w-full px-4 py-3 rounded-lg text-white outline-none"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            />
        </div>
        <button
            onclick={saveClient}
            disabled={saving}
            class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors disabled:opacity-50"
        >
            {#if saving}
                <span class="material-symbols-outlined text-sm animate-spin"
                    >progress_activity</span
                >
                Saving...
            {:else}
                <span class="material-symbols-outlined text-sm">save</span>
                {editingClient ? "Update" : "Add"} Client
            {/if}
        </button>
    </div>
</AdminModal>

<ConfirmModal
    bind:show={showConfirm}
    title="Delete Client"
    message={`Are you sure you want to delete "${pendingDelete?.name}"? This action cannot be undone.`}
    confirmLabel="Delete"
    variant="danger"
    loading={deleting}
    onconfirm={confirmDelete}
    oncancel={() => {
        showConfirm = false;
        pendingDelete = null;
    }}
/>
