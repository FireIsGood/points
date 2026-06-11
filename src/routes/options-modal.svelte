<script lang="ts">
	import { PUBLIC_SITE_URL } from '$env/static/public';
	import { enhance } from '$app/forms';
	import type { ActionData, SubmitFunction } from './$types';
	import Modal from '$lib/modal.svelte';
	import { clipboardCopy } from '$lib/util';
	import toast from 'svelte-french-toast';

	let {
		users = $bindable(),
		transactions = $bindable(),
		form = $bindable(),
		isAdmin = $bindable()
	}: {
		users: {
			id: string;
			username: string;
			points: number;
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

	async function shareId(id: string) {
		const user = users.find((u) => u.id === id);
		if (user === undefined) {
			toast.error('Unable to find user');
			return;
		}
		const message = `Your UUID is \`${user.id}\` at ${PUBLIC_SITE_URL} under the username **${user.username}** and \
your current balance is \`${user.points}\` points.\n\n\
Anyone with your UUID can see your current points and all point transactions you have done. \
I can change your UUID at your request which will break tracking for everyone watching it. \
Usernames are cosmetic to your internal ID and UUID, so I can change them at your request without affecting your point \
balance or history.`;
		await clipboardCopy(message);
		toast.success('Copied share message to clipboard');
	}
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
			<button class="secondary outline" onclick={() => shareId(optionsId)}>Share UUID</button>
		</section>
	{:else}
		<div>Not much you can really do here...</div>
	{/if}
</Modal>

<style>
	.actions {
		display: flex;
		gap: 1ch;
	}
</style>
