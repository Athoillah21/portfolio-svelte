<script lang="ts">
    let {
        message = "",
        type = "success",
        visible = $bindable(false),
    }: {
        message: string;
        type: "success" | "error" | "info";
        visible: boolean;
    } = $props();

    $effect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                visible = false;
            }, 3000);
            return () => clearTimeout(timer);
        }
    });
</script>

{#if visible}
    <div
        class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-xl transition-all duration-300 animate-scale-in"
        style="background: {type === 'success'
            ? 'rgba(34,197,94,0.15)'
            : type === 'error'
              ? 'rgba(239,68,68,0.15)'
              : 'rgba(147,51,234,0.15)'}; border: 1px solid {type === 'success'
            ? 'rgba(34,197,94,0.3)'
            : type === 'error'
              ? 'rgba(239,68,68,0.3)'
              : 'rgba(147,51,234,0.3)'};"
    >
        <span
            class="material-symbols-outlined text-lg"
            style="color: {type === 'success'
                ? '#4ade80'
                : type === 'error'
                  ? '#f87171'
                  : '#c084fc'};"
        >
            {type === "success"
                ? "check_circle"
                : type === "error"
                  ? "error"
                  : "info"}
        </span>
        <span class="text-sm text-white font-medium">{message}</span>
    </div>
{/if}
