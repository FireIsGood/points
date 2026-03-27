<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, SubmitFunction } from './$types';
	import Modal from '$lib/modal.svelte';

	let {
		users = $bindable(),
		transactions = $bindable(),
		form = $bindable(),
		isAdmin = $bindable()
	}: {
		users: {
			id: string;
			username: string;
		}[];
		transactions: {
			id: string | null;
			delta: number;
			note: string;
			createdAt: Date;
			updatedAt: Date;
		}[];
		form: ActionData;
		isAdmin: boolean;
	} = $props();

	export function open(id: string) {
		optionsId = id;
		addTransactionOpen = false;
		updateUserOpen = false;
		optionsModal.open();
	}

	function enhanceSubmit(): ReturnType<SubmitFunction> {
		return async ({ update }) => {
			await update();
			if (form?.success) {
				optionsModal.close();
			}
		};
	}

	let optionsId = $state('');
	let optionsModal: Modal;
	let username = $derived(users.find(({ id }) => id === optionsId)?.username);

	// Various bindings
	let untrackButton: HTMLInputElement;
	let addTransactionOpen = $state(false);
	let updateUserOpen = $state(false);
</script>

<Modal bind:this={optionsModal}>
	{#snippet header()}
		<p>Options ({username})</p>
	{/snippet}
	<fieldset class="actions">
		<button class="secondary" onclick={() => untrackButton.click()}>Untrack {username}</button>
		<div class="hidden">
			<form method="POST" action="/?/untrack" use:enhance={enhanceSubmit}>
				<!-- svelte-ignore a11y_no_redundant_roles -->
				<fieldset role="group">
					<input
						name="id"
						type="text"
						placeholder="UUID"
						required
						bind:value={() => optionsId, () => {}}
					/>
					<input type="submit" bind:this={untrackButton} />
				</fieldset>
			</form>
		</div>
	</fieldset>
	<div>Not much you can really do here...</div>
	{#if isAdmin}
		<section class="admin-actions-container">
			<p class="admin-actions-title">Admin Actions</p>
			<details class="admin-collapsible" bind:open={addTransactionOpen}>
				<summary>Add transaction</summary>
				<form method="POST" action="/?/createTransaction" use:enhance={enhanceSubmit}>
					<label class="hidden">
						ID
						<input
							name="id"
							type="text"
							placeholder="UUID"
							required
							bind:value={() => optionsId, () => {}}
						/>
					</label>
					<label>
						Delta
						<input name="delta" type="number" placeholder="0" required />
					</label>
					<label>
						Note
						<input name="note" type="text" placeholder="Why?" required />
					</label>
					<input type="submit" />
				</form>
			</details>
			<details class="admin-collapsible" bind:open={updateUserOpen}>
				<summary>Update user</summary>
				<form method="POST" action="/?/updateUser" use:enhance={enhanceSubmit}>
					<label class="hidden">
						<input name="id" type="text" required bind:value={() => optionsId, () => {}} />
					</label>
					<label>
						New UUID
						<input name="new_id" placeholder="UUID" type="text" />
					</label>
					<label>
						New Username
						<input name="new_username" placeholder="Jane Database" type="text" />
					</label>
					<input type="submit" />
				</form>
			</details>
		</section>
	{/if}
</Modal>

<style>
	.actions {
		display: flex;
		gap: 1ch;
	}
</style>
