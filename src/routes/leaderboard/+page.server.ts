import { COOKIE_TRACKING, cyrb53 } from '$lib';
import { cookieAdmin, Tracking } from '$lib/server/api';
import { getTotalPoints, getUsers, getUsersAdmin } from '$lib/server/database';
import syllables from '$lib/syllables';
import type { PageServerLoad } from './$types';

function anonymizeUsername(name: string): string {
	const hash = cyrb53(name);
	let num = hash;

	// To syllable string (custom base256 set)
	const resArray = [];
	while (num > 0) {
		let rem = num % 256;
		resArray.unshift(syllables[rem]);
		num = Math.floor(num / 256);
	}

	return resArray.join('-');
}

type LeaderboardEntry = Awaited<ReturnType<typeof getUsersAdmin>>[0] & {
	stake: number | any;
};

export const load: PageServerLoad = async ({ cookies }) => {
	const isAdmin = cookieAdmin(cookies);
	const tracking = new Tracking(cookies.get(COOKIE_TRACKING));

	const [totalPoints, allUsersRaw] = await Promise.all([getTotalPoints(), getUsersAdmin()]);

	const allUsers: LeaderboardEntry[] = allUsersRaw
		.toSorted((a, b) => b.points - a.points)
		.map((u) => Object.assign(u, { stake: (u.points * 100) / totalPoints }));

	const anonUsers = allUsers.map<LeaderboardEntry>((user) => {
		const tracked = tracking.has(user.id);
		return {
			id: tracked ? user.id : '',
			username: tracked ? user.username : anonymizeUsername(user.username),
			points: user.points,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			stake: (user.points * 100) / totalPoints
		};
	});

	if (isAdmin) {
		return {
			role: 'admin',
			users: anonUsers,
			allUsers: allUsers
		};
	}

	return {
		role: 'user',
		users: anonUsers,
		allUsers: anonUsers
	};
};
