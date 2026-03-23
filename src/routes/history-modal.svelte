<script lang="ts">
	import type { ActionData } from './$types';
	import Modal from '$lib/modal.svelte';
	import dayjs from 'dayjs';

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
				</tr>
			</thead>
			<tbody>
				{#each transactionsFiltered as transaction}
					<tr>
						<td>{dayjs(transaction.updatedAt).format('MMM DD, YYYY @ HH:mm:ss')}</td>
						<td
							class="table-number"
							class:positive={transaction.delta > 0}
							class:negative={transaction.delta < 0}
							>{transaction.delta > 0 ? '+' : ''}{transaction.delta}</td
						>
						<td>{transaction.note}</td>
					</tr>
				{:else}
					<tr><td colspan="3">No data.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
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
</style>
