<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createDialog } from 'svelte-headlessui';

	interface Props {
		header: Snippet;
		children: Snippet;
		commands?: Snippet;
		onclose?: () => void;
	}

	let { header, children, commands, onclose = () => {} }: Props = $props();

	const dialog = createDialog();

	export function open() {
		dialog.open();
	}

	export function close() {
		dialog.close();
	}
</script>

<dialog open={$dialog.expanded}>
	<article use:dialog.modal {onclose}>
		<header>
			<button onclick={close} aria-label="Close" class="close-button"></button>
			{@render header()}
		</header>
		{@render children()}
		{#if commands}
			<footer>
				{@render commands()}
			</footer>
		{/if}
	</article>
</dialog>

<style>
	header {
		font-size: 1.5rem;
	}

	.close-button {
		display: block;
		width: 2em;
		height: 2em;
		margin-left: var(--pico-spacing);
		margin-bottom: auto;
		float: right;
		border: none;
		background-image: var(--pico-icon-close);
		background-position: center;
		background-size: auto 1.5rem;
		background-repeat: no-repeat;
		background-color: transparent;
		opacity: 0.5;
		transition: opacity var(--pico-transition);

		&:hover {
			opacity: 1;
		}
	}
</style>
