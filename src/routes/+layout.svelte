<script lang="ts">
	import "../app.css";
	import GalaxyLoader from "$lib/components/GalaxyLoader.svelte";
	import SplineBackground from "$lib/components/SplineBackground.svelte";
	import NavigationLoader from "$lib/components/NavigationLoader.svelte";
	import Nav from "$lib/components/Nav.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import Chatbot from "$lib/components/Chatbot.svelte";
	import { onMount } from "svelte";
	import { page } from "$app/stores";

	let { children, data } = $props();

	// Pointer tracking for data-glow effect
	onMount(() => {
		const syncPointer = (e: PointerEvent) => {
			document.documentElement.style.setProperty(
				"--x",
				e.clientX.toFixed(2) + "px",
			);
			document.documentElement.style.setProperty(
				"--y",
				e.clientY.toFixed(2) + "px",
			);
		};
		document.body.addEventListener("pointermove", syncPointer);
		return () =>
			document.body.removeEventListener("pointermove", syncPointer);
	});
</script>

<GalaxyLoader />
<NavigationLoader />
<SplineBackground />
<div class="content-container min-h-screen flex flex-col text-white">
	<Nav user={data.user} />
	<main class="flex-1">
		{#key $page.url.pathname}
			<div class="page-transition">
				{@render children()}
			</div>
		{/key}
	</main>
	<Footer />
</div>
<Chatbot />
