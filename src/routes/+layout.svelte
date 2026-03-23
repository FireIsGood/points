<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from 'svelte-french-toast';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.green.min.css"
	/>
</svelte:head>

<header class="container-fluid">
	<h1>FireIsPoints</h1>
</header>
<main class="container-fluid">
	{@render children()}
</main>
<footer>
	<p>Created by <a href="https://github.com/FireIsGood" target="_blank">FireIsGood</a></p>
	<p><a href="" target="_blank">Source Code</a></p>
</footer>

<Toaster />

<style>
	header {
		display: flex;
		justify-content: space-between;
		padding: 1rem;
		padding: var(--pico-block-spacing-vertical) var(--pico-block-spacing-horizontal);
		border-bottom-right-radius: 8px;
		border-bottom-left-radius: 8px;
		background: var(--pico-card-background-color);
		outline: 1px solid var(--pico-muted-border-color);
		margin-bottom: 1rem;

		h1 {
			margin: 0;
		}
	}
	footer {
		display: flex;
		justify-content: space-between;
		padding: 1rem;

		p {
			margin: 0;
		}
	}
</style>
