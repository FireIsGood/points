<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import toast from 'svelte-french-toast';
	import { clipboardCopy, updateLocalStorage } from '$lib/util';
	import AddTrack from './add-track-modal.svelte';
	import HistoryModal from './history-modal.svelte';
	import OptionsModal from './options-modal.svelte';
	import dayjs from 'dayjs';

	let { data, form }: PageProps = $props();

	async function copyId(id: string) {
		const res = await clipboardCopy(id);

		if (res) {
			toast.success('UUID copied to clipboard');
		} else {
			toast.error('Could not copy to clipboard');
		}
	}

	// Toasts
	$effect(() => {
		if (form?.success) {
			toast.success(form.message);
		}
		if (form?.success === false) {
			toast.error(form.message);
		}

		updateLocalStorage(form);
	});

	let viewIds = $state(false);
	let viewAsUser = $state(false);
	let viewLogIds = $state(false);
	let viewLogTimes = $state(false);
	let isAdmin = $derived(data.role === 'admin');

	// Filter users for admin view
	let users = $derived.by(() => {
		if (!isAdmin || !viewAsUser) return data.users;

		// User is an admin viewing just their tracked list
		const tracking = new Set(data.tracking);
		return data.users.filter(({ id }) => tracking.has(id));
	});

	// Shared Modals
	let optionsModal: OptionsModal;
	let historyModal: HistoryModal;
</script>

<OptionsModal
	bind:this={optionsModal}
	users={data.users}
	transactions={data.transactions}
	bind:form
	bind:isAdmin
/>
<HistoryModal
	bind:this={historyModal}
	users={data.users}
	transactions={data.transactions}
	bind:form
	bind:isAdmin
/>

<article>
	<h2>Point Tracker</h2>
	{#if data.users.length === 0 && !isAdmin}
		<p>
			You don't have any users tracked! Ask for the UUID of yourself or someone else and add it
			below to get started.
		</p>
		<form method="POST" action="?/track" use:enhance>
			<label for="id">Track User</label>
			<!-- svelte-ignore a11y_no_redundant_roles -->
			<fieldset role="group">
				<input name="id" type="text" placeholder="UUID" required />
				<input type="submit" />
			</fieldset>
		</form>
	{:else}
		<div class="noresize table-holder">
			<table class="striped">
				<thead>
					<tr>
						<th>Username</th>
						<th class="header-points">Points</th>
						{#if viewIds}
							<th class="header-id">UUID</th>
						{/if}
						<th class="header-actions">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each users as user}
						<tr>
							<td
								>{user.username}{#if isAdmin && !viewAsUser && data.tracking.includes(user.id)}<sup
										>&hearts;</sup
									>{/if}</td
							>
							<td
								class="table-number"
								class:positive={user.points > 0}
								class:negative={user.points < 0}>{user.points.toLocaleString()}</td
							>
							{#if viewIds}
								<td class="table-id"
									><button class="contents" onclick={() => copyId(user.id)}
										><code>{user.id}</code></button
									></td
								>
							{/if}
							<td class="table-action">
								<div class="action-buttons">
									<button class="table-action-button" onclick={() => historyModal.open(user.id)}
										>History</button
									>
									<button
										class="table-action-button secondary outline"
										onclick={() => optionsModal.open(user.id)}>Options</button
									>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="table-footer-actions">
			<AddTrack bind:form />
			<div class="option-group">
				{#if data.role === 'admin'}
					<label>
						<input type="checkbox" bind:checked={viewAsUser} />User View
					</label>
				{/if}
				<label>
					<input type="checkbox" bind:checked={viewIds} />Show UUIDs
				</label>
			</div>
		</div>
	{/if}
</article>
{#if isAdmin}
	<article>
		<h2>Transaction Log</h2>
		<div class="noresize table-holder">
			<table class="striped">
				<thead>
					<tr>
						<th class="header-points">Delta</th>
						<th class="header-note">Note</th>
						<th>User</th>
						{#if viewLogIds}
							<th>UUID</th>
						{/if}
						<th class="header-date">Creation Time</th>
						{#if viewLogTimes}
							<th class="header-date">Modified Time</th>
						{/if}
					</tr>
				</thead>
				<tbody>
					{#each data.transactions as transaction}
						<tr>
							<td
								class="table-number"
								class:positive={transaction.delta > 0}
								class:negative={transaction.delta < 0}
								>{transaction.delta > 0 ? '+' : ''}{transaction.delta.toLocaleString()}</td
							>
							<td>{transaction.note}</td>
							<td>{transaction.username}</td>
							{#if viewLogIds}
								<td>{transaction.id}</td>
							{/if}
							<td
								><time datetime={transaction.createdAt.toISOString()}
									>{dayjs(transaction.createdAt).format('MMM DD, YYYY @ HH:mm:ss')}</time
								></td
							>
							{#if viewLogTimes}
								<td
									><time datetime={transaction.updatedAt.toISOString()}
										>{dayjs(transaction.createdAt).format('MMM DD, YYYY @ HH:mm:ss')}</time
									></td
								>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="table-footer-actions">
			<div class="option-group">
				<label>
					<input type="checkbox" bind:checked={viewLogIds} />Show UUIDs
				</label>
				<label>
					<input type="checkbox" bind:checked={viewLogTimes} />Show Modification Times
				</label>
			</div>
		</div>
	</article>
{/if}

<style>
	.table-holder {
		margin-bottom: 1rem;

		& > table {
			margin-bottom: 0;
		}
	}

	.header-id {
		width: calc(36ch + 1.5rem);
	}
	.header-points {
		text-align: right;
		width: 12ch;
	}
	.header-actions {
		text-align: center;
		width: 18ch;
	}
	.header-note {
		width: 40ch;
	}
	.header-date {
		width: 25ch;
	}

	.table-id {
		padding-block: 0;
		border-right: 2px dashed var(--pico-muted-border-color);
		font-family: var(--pico-font-family-monospace);
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
	.table-action-button {
		padding: 0 0.25rem;
	}
	.table-action {
		border-left: 2px dashed var(--pico-muted-border-color);
		padding: calc(var(--pico-spacing) / 2);
	}

	.action-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.125rem;
		justify-content: space-around;
	}

	.table-footer-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 0.5rem;
		justify-content: space-between;
		margin-inline: 1rem;
		margin-bottom: 0.75rem;
	}
	.option-group {
		display: flex;
		gap: 2ch;
	}
</style>
