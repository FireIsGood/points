<script lang="ts">
	import { enhance } from '$app/forms';
	import toast from 'svelte-french-toast';
	import type { PageProps } from '../$types';
	import { updateLocalStorage } from '$lib/util';

	let { data, form }: PageProps = $props();

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
</script>

<svelte:head>
	<title>FireIsPoints - Admin</title>
</svelte:head>

<article>
	<h2>Admin</h2>
	<p>Secret admin page wow</p>
	<details class="admin-collapsible">
		<summary>Set admin key</summary>
		<form method="POST" action="?/adminAuth" use:enhance>
			<!-- svelte-ignore a11y_no_redundant_roles -->
			<fieldset role="group">
				<input name="admin_key" type="text" placeholder="Key" required />
				<input type="submit" value="Authorize" />
			</fieldset>
		</form>
	</details>
	<details class="admin-collapsible">
		<summary>Remove admin key</summary>
		<form method="POST" action="?/adminDeauth" use:enhance>
			<input type="submit" value="Deauthorize" />
		</form>
	</details>
	<p>Info</p>
	<pre>{JSON.stringify(data, null, 2)}</pre>
	{#if data.role === 'admin'}
		<p class="admin-actions-title">Admin Actions</p>
		<details class="admin-collapsible">
			<summary>Create user</summary>
			<form method="POST" action="?/createUser" use:enhance>
				<label>
					Username
					<input name="username" placeholder="Jane Database" type="text" required />
				</label>
				<input type="submit" />
			</form>
		</details>
		<details class="admin-collapsible">
			<summary>Delete user</summary>
			<form method="POST" action="?/deleteUser" use:enhance>
				<label>
					UUID
					<input name="id" type="text" placeholder="UUID" required />
				</label>
				<input type="submit" />
			</form>
		</details>
	{/if}
</article>
