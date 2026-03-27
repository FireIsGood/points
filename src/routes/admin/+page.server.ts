import { COOKIE_ADMIN, cookieAdmin } from '$lib';
import { api } from '$lib/server/api';
import type { Actions, PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const isAdmin = cookieAdmin(cookies);
	return {
		role: isAdmin ? 'admin' : 'user',
		admin_key: cookies.get(COOKIE_ADMIN)
	};
};

export const actions = {
	createUser: api.createUser,
	deleteUser: api.deleteUser,
	adminAuth: api.adminAuth,
	adminDeauth: api.adminDeauth
} satisfies Actions;
