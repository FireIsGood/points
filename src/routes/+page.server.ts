import * as dotenv from 'dotenv';
import type { Actions, PageServerLoad } from './$types';
import {
	getTransactions,
	getTransactionsAdmin,
	getUsers,
	getUsersAdmin
} from '$lib/server/database';
import { COOKIE_TRACKING } from '$lib';
import { wayLaterTimestamp } from '$lib/util';
import { api, cookieAdmin, Tracking } from '$lib/server/api';

dotenv.config();

export const load: PageServerLoad = async ({ cookies }) => {
	const isAdmin = cookieAdmin(cookies);
	const tracking = new Tracking(cookies.get(COOKIE_TRACKING));

	// Refresh tracking cookie
	cookies.set(COOKIE_TRACKING, tracking.toString(), { path: '/', expires: wayLaterTimestamp() });

	// Query DB
	if (isAdmin) {
		const users = await getUsersAdmin();
		const transactions = await getTransactionsAdmin();

		return {
			role: 'admin',
			users,
			transactions,
			tracking: [...tracking.ids]
		};
	}

	const users = await getUsers([...tracking.ids]);
	const transactions = await getTransactions([...tracking.ids]);

	return {
		role: 'user',
		users,
		transactions,
		tracking: [...tracking.ids]
	};
};

export const actions = {
	createTransaction: api.createTransaction,
	updateTransaction: api.updateTransaction,
	track: api.track,
	untrack: api.untrack,
	updateUser: api.updateUser,
	deleteTransaction: api.deleteTransaction
} satisfies Actions;
