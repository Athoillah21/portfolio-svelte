<script lang="ts">
	import { onMount } from "svelte";

	let loader: HTMLElement;

	onMount(() => {
		if (!loader) return;

		// Create orbiting particles
		for (let i = 0; i < 6; i++) {
			const particle = document.createElement("div");
			particle.className = "particle";
			const angle = (360 / 6) * i;
			const radius = 25 + (i % 2) * 10;
			particle.style.setProperty("--start-angle", `${angle}deg`);
			particle.style.setProperty("--orbit-radius", `${radius}px`);
			particle.style.animationDuration = `${1.5 + i * 0.15}s`;
			particle.style.width = `${2 + (i % 2)}px`;
			particle.style.height = `${2 + (i % 2)}px`;
			loader.appendChild(particle);
		}

		// Create micro stars
		for (let i = 0; i < 20; i++) {
			const star = document.createElement("div");
			star.className = "star";
			star.style.left = `${Math.random() * 100}%`;
			star.style.top = `${Math.random() * 100}%`;
			star.style.animationDelay = `${Math.random() * 2}s`;
			star.style.animationDuration = `${1.5 + Math.random()}s`;
			loader.appendChild(star);
		}

		// Hide loader after page load
		const minDisplayTime = 2000;
		const startTime = Date.now();
		const elapsed = Date.now() - startTime;
		const remaining = Math.max(0, minDisplayTime - elapsed);
		setTimeout(() => {
			loader.classList.add("fade-out");
			setTimeout(() => {
				loader.style.display = "none";
			}, 500);
		}, remaining);
	});
</script>

<div id="galaxy-loader" bind:this={loader}>
	<div class="galaxy-core"></div>
	<div class="galaxy-ring"></div>
	<div class="galaxy-ring"></div>
	<div class="galaxy-ring"></div>
	<div class="galaxy-ring"></div>
	<div class="galaxy-ring"></div>
</div>
