<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let isAdmin = $derived(data.role === 'admin');

	let users = $derived.by(() => {
		if (!isAdmin || viewAsUser) return data.users;

		return data.allUsers;
	});

	let viewIds = $state(false);
	let viewAsUser = $state(false);
</script>

<article>
	<h2>Leaderboard</h2>
	<p>An anonymized (if you do not track the UUID) leaderboard of top point holders.</p>
	<div class="noresize table-holder">
		<table class="striped">
			<thead>
				<tr>
					<th class="header-rank">Rank</th>
					<th>Username</th>
					<th class="header-points">Points</th>
					{#if viewIds}
						<th class="header-id">UUID</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each users as user}
					<tr class:anonymous={user.id === ''}>
						<td class="table-rank"
							>{user.rank} <span class="stake">{user.stake.toFixed(2)}%</span></td
						>
						<td class="table-username">{user.username}</td>
						<td
							class="table-number"
							class:positive={user.points > 0}
							class:negative={user.points < 0}>{user.points.toLocaleString()}</td
						>
						{#if viewIds}
							<td class="table-id">
								{#if user.id !== ''}
									<code>{user.id}</code>
								{:else}
									-
								{/if}
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<div class="table-footer-actions">
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
</article>

<style>
	.table-holder {
		margin-bottom: 1rem;

		& > table {
			margin-bottom: 0;
		}
	}

	.header-rank {
		width: 12ch;
		text-align: center;
	}
	.header-id {
		width: calc(36ch + 1.5rem);
	}
	.header-points {
		text-align: right;
		width: 12ch;
	}

	.table-rank {
		display: grid;
		grid-template-columns: 1fr auto minmax(5ch, 2fr);
		align-items: flex-end;
		justify-content: center;
		gap: 0.5ch;
		&::before {
			content: '';
		}

		.stake {
			font-size: smaller;
			color: var(--pico-muted-color);
			opacity: 0.7;
		}
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

	.anonymous {
		.table-username {
			color: var(--pico-muted-color);
			font-style: italic;
			opacity: 0.7;
		}
	}

	.table-footer-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 0.5rem;
		justify-content: right;
		margin-inline: 1rem;
		margin-bottom: 0.75rem;
	}
	.option-group {
		display: flex;
		gap: 2ch;
	}
</style>
