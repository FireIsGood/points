<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/flan.gif';
	import { Toaster } from 'svelte-french-toast';
	import { page } from '$app/state';

	let { children } = $props();

	const navLinks = [
		{ href: '/', linkText: 'Tracker' },
		{ href: '/about', linkText: 'About' }
	];
</script>

<svelte:head>
	<title>FireIsPoints</title>
	<link rel="icon" href={favicon} />
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.green.min.css"
	/>
</svelte:head>

<header class="container-fluid">
	<h1>FireIsPoints</h1>
	<nav>
		<ul>
			{#each navLinks as { href, linkText }}
				<li><a {href} class:active={page.url.pathname === href}>{linkText}</a></li>
			{/each}
		</ul>
	</nav>
</header>
<main class="container-fluid">
	{@render children()}
</main>
<footer>
	<p>Created by <a href="https://github.com/FireIsGood" target="_blank">FireIsGood</a></p>
	<p><a href="https://github.com/FireIsGood/points" target="_blank">Source Code</a></p>
</footer>

<Toaster />

<style>
	header {
		display: flex;
		justify-content: space-between;
		padding: 1rem 1.25rem;
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

	nav ul {
		gap: 0.25rem;
	}
	nav li {
		border-radius: 0.25rem;
	}

	nav li:has(> a.active) {
		background-color: color-mix(
			in srgb,
			var(--pico-card-background-color),
			var(--pico-primary-background) 8%
		);
	}
</style>
