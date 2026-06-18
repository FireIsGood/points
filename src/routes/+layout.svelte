<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/flan.gif';
	import { Toaster } from 'svelte-french-toast';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { syncLocalStorage } from '$lib/util';
	import { browser } from '$app/environment';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	let isAdmin = $derived(data.role === 'admin');

	type NavLink = {
		href: string;
		linkText: string;
		hidden?: boolean;
	};

	const navLinks: NavLink[] = $derived([
		{ href: '/', linkText: 'Tracker' },
		{ href: '/leaderboard', linkText: 'Leaderboard' },
		{ href: '/events', linkText: 'Events', hidden: !isAdmin },
		{ href: '/about', linkText: 'About' }
	]);

	onMount(() => {
		if (browser) {
			syncLocalStorage();
		}
	});
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
		<ul class="nav-links">
			{#each navLinks as { href, linkText, hidden }}
				{#if hidden !== true}
					<li><a {href} class:active={page.url.pathname === href}>{linkText}</a></li>
				{/if}
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
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.5rem 1rem;
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

	@media (width < 600px) {
		header {
			justify-content: center;
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

	.nav-links {
		flex-wrap: wrap;
		justify-content: center;
	}
</style>
