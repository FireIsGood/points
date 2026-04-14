import { COOKIE_ADMIN, COOKIE_TRACKING } from '$lib';
import toast from 'svelte-french-toast';
import type { ActionData } from '../routes/$types';
import { getCookie, setCookie } from './localCookie';

export async function clipboardCopy(data: string): Promise<boolean> {
	if ('clipboard' in navigator) {
		await navigator.clipboard.writeText(data);
		return true;
	}
	return false;
}

type Update = {
	set?: Record<string, string>;
	delete?: string[];
};

// Hack solution to make cookies also backed by localStorage

// Keys to back
const cookieKeys = [COOKIE_ADMIN, COOKIE_TRACKING] as const;

export function updateLocalStorage(form: ActionData) {
	if (form === null) return;

	const update: Update | undefined = form.localStorage;
	if (update === undefined) return;

	if (update.set) {
		for (const [key, value] of Object.entries(update.set)) {
			localStorage.setItem(key, encodeURIComponent(value));
		}
	}
	if (update.delete) {
		for (const key of update.delete) {
			localStorage.removeItem(key);
		}
	}
}

export function syncLocalStorage() {
	// Copy localStorage over cookies
	let updatedCookies = false;
	for (const key of cookieKeys) {
		const value = localStorage.getItem(key);
		if (value === null) continue;
		if (getCookie(key) !== null) continue;

		setCookie(key, value, 360, true);
		updatedCookies = true;
	}
}

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 360;
export function wayLaterTimestamp(): Date {
	return new Date(new Date().getTime() + ONE_YEAR_IN_SECONDS);
}
