import { COOKIE_ADMIN, COOKIE_TRACKING } from '$lib';
import bcrypt from 'bcrypt';
import { fail, type Cookies } from '@sveltejs/kit';
import type { Actions } from '../../routes/$types';
import {
	createTransaction,
	createUser,
	deleteTransaction,
	deleteUser,
	updateTransaction,
	updateUser,
	userExists
} from './database';
import type { transactions, users } from '$lib/server/db/schema';
import { wayLaterTimestamp } from '$lib/util';

export function cookieAdmin(cookies: Cookies): boolean {
	const user_key = cookies.get(COOKIE_ADMIN);
	if (user_key === undefined) return false;

	return bcrypt.compareSync(user_key, process.env.ADMIN_KEY ?? '');
}

export class Tracking {
	ids: Set<string>;

	constructor(serialized: string | undefined = undefined) {
		this.ids = new Set(serialized?.split(','));

		// split residue
		this.ids.delete('');
	}

	add(id: string) {
		if (userExists(id)) {
			this.ids.add(id);
		}
	}
	delete(id: string) {
		this.ids.delete(id);
	}
	has(id: string) {
		return this.ids.has(id);
	}

	toString() {
		return [...this.ids].join(',');
	}
}

export const api = {
	createTransaction: async ({ cookies, request }) => {
		const isAdmin = cookieAdmin(cookies);

		// Admin only resource
		if (!isAdmin) {
			return fail(403, { success: false, message: 'lmao no.' });
		}

		const data = await request.formData();
		const form_id = data.get('id');
		const form_delta = data.get('delta');
		const form_note = data.get('note');

		// Validate input
		if (
			!form_id ||
			typeof form_id !== 'string' ||
			!form_delta ||
			typeof form_delta !== 'string' ||
			!form_note ||
			typeof form_note !== 'string'
		) {
			return fail(400, { success: false, message: 'Missing required form data.' });
		}

		// Validate user exists
		if (!userExists(form_id)) return fail(400, { success: false, message: 'User not found.' });

		const res = await createTransaction({
			uuid: form_id,
			delta: parseInt(form_delta, 10),
			note: form_note
		});

		if (res === undefined) {
			return fail(500, { success: false, message: 'Server error.' });
		}

		return { success: true, message: 'Transaction logged.' };
	},
	updateTransaction: async ({ cookies, request }) => {
		const isAdmin = cookieAdmin(cookies);

		// Admin only resource
		if (!isAdmin) {
			return fail(403, { success: false, message: 'lmao no.' });
		}
		const data = await request.formData();
		const form_id = data.get('id');
		const form_createdAt = data.get('createdAt');
		const form_new_delta = data.get('new_delta');
		const form_new_note = data.get('new_note');

		// Validate input
		if (
			!form_id ||
			typeof form_id !== 'string' ||
			!form_createdAt ||
			typeof form_createdAt !== 'string' ||
			!form_new_delta ||
			typeof form_new_delta !== 'string' ||
			!form_new_note ||
			typeof form_new_note !== 'string'
		) {
			return fail(400, { success: false, message: 'Missing required form data.' });
		}

		const updateData: Partial<typeof transactions.$inferSelect> = {
			updatedAt: new Date(),
			delta: parseInt(form_new_delta, 10),
			note: form_new_note
		};

		const res = await updateTransaction(form_id, new Date(form_createdAt), updateData);

		if (res === undefined) {
			return fail(500, { success: false, message: 'Server error.' });
		}

		return { success: true, message: 'Transaction updated.' };
	},
	track: async ({ cookies, request }) => {
		const tracking = new Tracking(cookies.get(COOKIE_TRACKING));
		const data = await request.formData();
		const form_id = data.get('id');

		// Validate input
		if (!form_id || typeof form_id !== 'string') {
			return fail(400, { success: false, message: 'No ID given.' });
		}

		// Ensure ID exists
		if (!userExists(form_id)) {
			return fail(400, { success: false, message: 'User not found.' });
		}

		// Ensure ID is not already being tracked
		if (tracking.has(form_id)) {
			return fail(400, { success: false, message: 'You are already tracking this ID.' });
		}

		// Update cookie
		tracking.add(form_id);
		cookies.set(COOKIE_TRACKING, tracking.toString(), { path: '/', expires: wayLaterTimestamp() });

		return {
			success: true,
			message: 'Tracking added.',
			localStorage: { set: { [COOKIE_TRACKING]: tracking.toString() } }
		};
	},
	untrack: async ({ cookies, request }) => {
		const tracking = new Tracking(cookies.get(COOKIE_TRACKING));
		const data = await request.formData();
		const form_id = data.get('id');

		// Validate input
		if (!form_id || typeof form_id !== 'string') {
			return fail(400, { success: false, message: 'No ID given.' });
		}

		// Ensure ID is already being tracked
		if (!tracking.has(form_id)) {
			return fail(400, { success: false, message: 'You are not tracking this ID.' });
		}

		// Update cookie
		tracking.delete(form_id);
		cookies.set(COOKIE_TRACKING, tracking.toString(), { path: '/', expires: wayLaterTimestamp() });

		return {
			success: true,
			message: 'Tracking removed.',
			localStorage: { set: { [COOKIE_TRACKING]: tracking.toString() } }
		};
	},
	createUser: async ({ cookies, request }) => {
		const isAdmin = cookieAdmin(cookies);

		// Admin only resource
		if (!isAdmin) {
			return fail(403, { success: false, message: 'lmao no.' });
		}

		const data = await request.formData();
		const form_username = data.get('username');

		// Validate username
		if (!form_username || typeof form_username !== 'string') {
			return fail(400, { success: false, message: 'No username given.' });
		}

		const res = await createUser({ username: form_username });

		const tracking = new Tracking(cookies.get(COOKIE_TRACKING));

		// Auto-add
		tracking.add(res.uuid);

		cookies.set(COOKIE_TRACKING, tracking.toString(), { path: '/', expires: wayLaterTimestamp() });

		return {
			success: true,
			message: `User ${res.username} (${res.uuid}) created.`,
			localStorage: { set: { [COOKIE_TRACKING]: tracking.toString() } }
		};
	},
	updateUser: async ({ cookies, request }) => {
		const isAdmin = cookieAdmin(cookies);

		// Admin only resource
		if (!isAdmin) {
			return fail(403, { success: false, message: 'lmao no.' });
		}

		const data = await request.formData();
		const form_id = data.get('id');
		const form_new_id = data.get('new_id');
		const form_new_username = data.get('new_username');

		// Validate input
		if (
			typeof form_id !== 'string' ||
			typeof form_new_id !== 'string' ||
			typeof form_new_username !== 'string'
		) {
			return fail(400, { success: false, message: 'Missing required form data.' });
		}

		// Validate user exists
		if (!userExists(form_id)) return fail(400, { success: false, message: 'User not found.' });

		const updateData: Partial<typeof users.$inferInsert> = {
			updatedAt: new Date()
		};
		if (form_new_id !== '') {
			updateData.uuid = form_new_id;
		}
		if (form_new_username !== '') {
			updateData.username = form_new_username;
		}

		const res = await updateUser(form_id, updateData);

		return { success: true, message: `User ${res?.username} (${res?.uuid}) updated.` };
	},
	deleteUser: async ({ cookies, request }) => {
		const isAdmin = cookieAdmin(cookies);

		// Admin only resource
		if (!isAdmin) {
			return fail(403, { success: false, message: 'lmao no.' });
		}

		const data = await request.formData();
		const form_id = data.get('id');

		// Validate UUID
		if (!form_id || typeof form_id !== 'string') {
			return fail(400, { success: false, message: 'No UUID given.' });
		}

		// Validate user exists
		if (!userExists(form_id)) return fail(400, { success: false, message: 'User not found.' });

		const res = await deleteUser(form_id);

		return { success: true, message: `User ${res?.username} (${res?.uuid}) deleted.` };
	},
	deleteTransaction: async ({ cookies, request }) => {
		const isAdmin = cookieAdmin(cookies);

		// Admin only resource
		if (!isAdmin) {
			return fail(403, { success: false, message: 'lmao no.' });
		}

		const data = await request.formData();
		const form_id = data.get('id');
		const form_createdAt = data.get('createdAt');
		const form_confirm = data.get('confirm');

		// Validate input
		if (
			!form_id ||
			typeof form_id !== 'string' ||
			!form_createdAt ||
			typeof form_createdAt !== 'string' ||
			!form_confirm ||
			typeof form_confirm !== 'string'
		) {
			return fail(400, { success: false, message: 'Missing required form data.' });
		}

		// Ensure confirmation is true
		if (form_confirm !== 'Yes') {
			return fail(400, { success: false, message: 'Incorrect confirmation.' });
		}

		const res = await deleteTransaction(form_id, new Date(form_createdAt));

		if (res === undefined) {
			return fail(500, { success: false, message: 'Server error.' });
		}

		return { success: true, message: 'Transaction deleted.' };
	},
	adminAuth: async ({ cookies, request }) => {
		const data = await request.formData();
		const form_key = data.get('admin_key');

		// Validate input
		if (!form_key || typeof form_key !== 'string') {
			return fail(400, { success: false, message: 'No admin key given.' });
		}

		cookies.set(COOKIE_ADMIN, form_key, {
			path: '/',
			encode: (s) => s,
			expires: wayLaterTimestamp()
		});

		return {
			success: true,
			message: 'Added authorization..',
			localStorage: { set: { [COOKIE_ADMIN]: form_key } }
		};
	},
	adminDeauth: async ({ cookies }) => {
		cookies.delete(COOKIE_ADMIN, { path: '/' });

		return {
			success: true,
			message: 'Removed authorization.',
			localStorage: { delete: [COOKIE_ADMIN] }
		};
	}
} satisfies Actions;
