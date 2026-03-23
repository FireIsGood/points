import { COOKIE_ADMIN } from '$lib';
import { fail } from '@sveltejs/kit';
import type { Actions } from '../$types';

export const actions = {
	adminAuth: async ({ cookies, request }) => {
		const data = await request.formData();
		const form_key = data.get('admin_key');

		// Validate input
		if (!form_key || typeof form_key !== 'string') {
			return fail(400, { success: false, message: 'No admin key given.' });
		}

		cookies.set(COOKIE_ADMIN, form_key, { path: '/', encode: (s) => s });

		return { success: true, message: 'Added authorization..' };
	},
	adminDeauth: async ({ cookies }) => {
		cookies.delete(COOKIE_ADMIN, { path: '/' });

		return { success: true, message: 'Removed authorization.' };
	}
} satisfies Actions;
