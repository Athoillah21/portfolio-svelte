<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        show = $bindable(false),
        title = "",
        onclose,
        children,
    }: {
        show: boolean;
        title: string;
        onclose: () => void;
        children: Snippet;
    } = $props();

    // Lock body scroll when modal is open
    $effect(() => {
        if (show) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    });
</script>

{#if show}
    <!-- Backdrop -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        onclick={(e) => {
            if (e.target === e.currentTarget) onclose();
        }}
        onkeydown={(e) => {
            if (e.key === "Escape") onclose();
        }}
    >
        <!-- Overlay -->
        <div
            class="absolute inset-0"
            style="background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);"
        ></div>

        <!-- Modal -->
        <div
            class="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl animate-scale-in"
            style="background: rgba(17,24,39,0.95); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px rgba(0,0,0,0.5);"
        >
            <!-- Header -->
            <div
                class="sticky top-0 flex items-center justify-between px-6 py-4 border-b z-10"
                style="background: rgba(17,24,39,0.98); border-color: rgba(255,255,255,0.1);"
            >
                <h3 class="text-lg font-semibold text-white">{title}</h3>
                <button
                    onclick={onclose}
                    class="p-1.5 rounded-lg transition-colors"
                    style="color: #9ca3af;"
                    onmouseenter={(e) => (e.currentTarget.style.color = "#fff")}
                    onmouseleave={(e) =>
                        (e.currentTarget.style.color = "#9ca3af")}
                >
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <!-- Body -->
            <div class="p-6">
                {@render children()}
            </div>
        </div>
    </div>
{/if}
