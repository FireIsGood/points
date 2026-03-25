<script lang="ts">
	import type { ActionData } from './$types';
	import IconEdit from 'phosphor-icons-svelte/IconPencilBold.svelte';
	import IconDelete from 'phosphor-icons-svelte/IconTrashSimpleBold.svelte';
	import Modal from '$lib/modal.svelte';
	import dayjs from 'dayjs';
	import { enhance } from '$app/forms';

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
		filterId = id;
		historyModal.open();
	}

	let historyModal: Modal;

	let filterId = $state('');
	let transactionsFiltered = $derived(transactions.filter(({ id }) => id === filterId));
	let username = $derived(users.find(({ id }) => id === filterId)?.username);

	// Edit
	type EditData = { id: string | null; createdAt: Date; delta: number; note: string };
	let editModal: Modal;

	function openEdit(data: EditData) {
		if (data.id === null) return;
		editData = data;
		editNewDelta.value = data.delta.toString();
		editNewNote.value = data.note;
		editModal.open();
	}

	let editData = $state<EditData>();
	let editNewNote: HTMLInputElement;
	let editNewDelta: HTMLInputElement;
</script>

<Modal bind:this={historyModal}>
	{#snippet header()}
		<p>Point History ({username})</p>
	{/snippet}
	<div class="noresize">
		<table class="striped">
			<thead>
				<tr>
					<th class="header-date">Date</th>
					<th class="header-points">Change</th>
					<th>Note</th>
					<th class="header-actions">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each transactionsFiltered as transaction}
					<tr>
						<td
							><time datetime={transaction.updatedAt.toISOString()}
								>{dayjs(transaction.updatedAt).format('MMM DD, YYYY @ HH:mm:ss')}</time
							></td
						>
						<td
							class="table-number"
							class:positive={transaction.delta > 0}
							class:negative={transaction.delta < 0}
							>{transaction.delta > 0 ? '+' : ''}{transaction.delta}</td
						>
						<td>{transaction.note}</td>
						<td class="table-action">
							<div class="history-actions">
								<button
									class="secondary outline"
									aria-label="edit"
									title="Edit"
									onclick={() => {
										historyModal.close();
										openEdit(transaction);
									}}><IconEdit /></button
								>
								<button class="danger outline" aria-label="delete" title="Delete"
									><IconDelete /></button
								>
							</div>
						</td>
					</tr>
				{:else}
					<tr><td colspan="4">No data.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</Modal>

<Modal bind:this={editModal}>
	{#snippet header()}
		<p>Edit transaction</p>
	{/snippet}
	<form
		method="POST"
		action="/?/updateTransaction"
		use:enhance={() => {
			return async ({ update }) => {
				await update({ reset: false });
				if (form?.success) {
					editModal.close();
				}
			};
		}}
	>
		<label class="hidden">
			ID
			<input name="id" type="text" required bind:value={() => editData?.id ?? '', () => {}} />
		</label>
		<label class="hidden">
			Creation time
			<input
				name="createdAt"
				type="text"
				required
				bind:value={() => editData?.createdAt ?? '', () => {}}
			/>
		</label>
		<label>
			New Delta
			<input name="new_delta" type="number" placeholder="0" required bind:this={editNewDelta} />
		</label>
		<label>
			New Note
			<input name="new_note" type="text" placeholder="Why?" required bind:this={editNewNote} />
		</label>
		<input type="submit" />
	</form>
	<p>Raw</p>
	<pre>{JSON.stringify(editData, null, 2)}</pre>
</Modal>

<style>
	table {
		margin-bottom: 0;
	}

	.header-date {
		width: 28ch;
	}
	.header-points {
		width: 12ch;
		text-align: right;
	}
	.header-actions {
		text-align: center;
		width: 6rem;
	}

	.table-number {
		text-align: right;
		font-family: var(--pico-font-family-monospace);

		&.positive {
			color: var(--color-positive);
		}
		&.negative {
			color: var(--color-negative);
		}
	}
	.table-action {
		padding: calc(var(--pico-spacing) / 2);
	}

	.history-actions {
		display: flex;
		justify-content: space-evenly;
	}

	.danger {
		--pico-primary: var(--color-negative);
		--pico-primary-hover: var(--color-negative);
	}
</style>
