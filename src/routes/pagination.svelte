<script lang="ts">
	import { onMount } from 'svelte';

	let {
		allRows = $bindable(),
		filteredRows = $bindable(),
		rowsPerPage = $bindable()
	}: {
		allRows: any[];
		filteredRows: any[];
		rowsPerPage: number;
	} = $props();

	let currentPage = $state(0);
	let totalPages = Math.ceil(allRows.length / rowsPerPage);

	let start = $derived(currentPage * rowsPerPage);
	let end = $derived(start + rowsPerPage);

	$effect(() => {
		filteredRows = allRows.slice(start, end);
	});
</script>

<div class="pagination">
	<button class="secondary" disabled={currentPage <= 0} onclick={() => currentPage--}>&larr;</button
	>
	<div>
		{start + 1}&ndash;{Math.min(end, allRows.length)} of {allRows.length}
	</div>
	<button class="secondary" disabled={currentPage >= totalPages - 1} onclick={() => currentPage++}
		>&rarr;</button
	>
</div>

<style>
	.pagination {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}
</style>
