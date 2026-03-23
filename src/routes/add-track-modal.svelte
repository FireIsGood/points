<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import IconPlus from 'phosphor-icons-svelte/IconPlusBold.svelte';
	import Modal from '$lib/modal.svelte';

	let { form = $bindable() }: { form: ActionData } = $props();

	function open() {
		trackingModal.open();
		trackingModalId = '';
	}

	let trackingModal: Modal;
	let trackingModalId: string = $state('');
</script>

<button onclick={open} class="outline"><IconPlus /> Add Tracking</button>
<Modal bind:this={trackingModal} onclose={() => {}}>
	{#snippet header()}
		<p>Add tracking</p>
	{/snippet}
	<form
		method="POST"
		action="?/track"
		use:enhance={() => {
			return async ({ update }) => {
				await update();
				if (form?.success) {
					trackingModal.close();
				}
			};
		}}
	>
		<!-- svelte-ignore a11y_no_redundant_roles -->
		<fieldset role="group">
			<input name="id" type="text" placeholder="UUID" required bind:value={trackingModalId} />
			<input type="submit" />
		</fieldset>
	</form>
</Modal>

<style>
	fieldset {
		margin-bottom: 0;
	}

	button {
		display: flex inline;
		align-items: center;
		gap: 0.25ch;
	}
</style>
