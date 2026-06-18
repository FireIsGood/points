import { cookieAdmin } from '$lib/server/api';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies }) => {
	const isAdmin = cookieAdmin(cookies);
	return {
		role: isAdmin ? 'admin' : 'user'
	};
};
