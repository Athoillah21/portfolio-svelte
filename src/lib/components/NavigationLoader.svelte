<script lang="ts">
    import { navigating } from "$app/stores";
</script>

{#if $navigating}
    <div class="nav-loader">
        <div class="nav-loader-bar"></div>
    </div>
{/if}

<style>
    .nav-loader {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        z-index: 9998;
        overflow: hidden;
    }

    .nav-loader-bar {
        height: 100%;
        background: linear-gradient(90deg, #a855f7, #ec4899, #a855f7);
        background-size: 200% 100%;
        animation:
            nav-loading 1s ease-in-out infinite,
            nav-grow 0.4s ease-out forwards;
        border-radius: 0 2px 2px 0;
        box-shadow:
            0 0 10px rgba(168, 85, 247, 0.5),
            0 0 20px rgba(168, 85, 247, 0.3);
    }

    @keyframes nav-loading {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }

    @keyframes nav-grow {
        0% {
            width: 0%;
        }
        50% {
            width: 60%;
        }
        100% {
            width: 85%;
        }
    }
</style>
