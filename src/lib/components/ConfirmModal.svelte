<script lang="ts">
    let {
        show = $bindable(false),
        title = "Confirm Action",
        message = "Are you sure?",
        confirmLabel = "Delete",
        cancelLabel = "Cancel",
        variant = "danger",
        loading = false,
        onconfirm,
        oncancel,
    }: {
        show: boolean;
        title?: string;
        message?: string;
        confirmLabel?: string;
        cancelLabel?: string;
        variant?: "danger" | "warning" | "info";
        loading?: boolean;
        onconfirm: () => void;
        oncancel: () => void;
    } = $props();

    const colors = $derived(
        variant === "danger"
            ? {
                  bg: "rgba(239,68,68,0.15)",
                  border: "rgba(239,68,68,0.3)",
                  icon: "#f87171",
                  btn: "bg-red-600 hover:bg-red-500",
              }
            : variant === "warning"
              ? {
                    bg: "rgba(245,158,11,0.15)",
                    border: "rgba(245,158,11,0.3)",
                    icon: "#fbbf24",
                    btn: "bg-amber-600 hover:bg-amber-500",
                }
              : {
                    bg: "rgba(147,51,234,0.15)",
                    border: "rgba(147,51,234,0.3)",
                    icon: "#c084fc",
                    btn: "bg-purple-600 hover:bg-purple-500",
                },
    );
</script>

{#if show}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
        onclick={(e) => {
            if (e.target === e.currentTarget && !loading) oncancel();
        }}
        onkeydown={(e) => {
            if (e.key === "Escape" && !loading) oncancel();
        }}
    >
        <div
            class="absolute inset-0"
            style="background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);"
        ></div>

        <div
            class="relative z-10 w-full max-w-sm rounded-2xl animate-scale-in p-6"
            style="background: rgba(17,24,39,0.97); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px rgba(0,0,0,0.5);"
        >
            <!-- Icon -->
            <div class="flex justify-center mb-5">
                <div
                    class="w-14 h-14 rounded-full flex items-center justify-center"
                    style="background: {colors.bg}; border: 1px solid {colors.border};"
                >
                    <span
                        class="material-symbols-outlined text-3xl"
                        style="color: {colors.icon};"
                    >
                        {variant === "danger"
                            ? "delete_forever"
                            : variant === "warning"
                              ? "warning"
                              : "help"}
                    </span>
                </div>
            </div>

            <!-- Text -->
            <h3 class="text-lg font-semibold text-white text-center mb-2">
                {title}
            </h3>
            <p class="text-gray-400 text-sm text-center mb-6 leading-relaxed">
                {message}
            </p>

            <!-- Actions -->
            <div class="flex gap-3">
                <button
                    onclick={oncancel}
                    disabled={loading}
                    class="flex-1 px-4 py-2.5 rounded-lg text-gray-300 hover:text-white transition-all text-sm font-medium disabled:opacity-50"
                    style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);"
                >
                    {cancelLabel}
                </button>
                <button
                    onclick={onconfirm}
                    disabled={loading}
                    class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white transition-all text-sm font-medium disabled:opacity-50 {colors.btn}"
                >
                    {#if loading}
                        <span
                            class="material-symbols-outlined text-sm animate-spin"
                            >progress_activity</span
                        >
                        Deleting...
                    {:else}
                        <span class="material-symbols-outlined text-sm"
                            >{variant === "danger" ? "delete" : "check"}</span
                        >
                        {confirmLabel}
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}
