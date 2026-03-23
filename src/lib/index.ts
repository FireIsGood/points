// place files you want to import through the `$lib` alias in this folder.

import type { Cookies } from '@sveltejs/kit';

export const COOKIE_ADMIN = 'admin_key';
export const COOKIE_TRACKING = 'tracking';
export function cookieAdmin(cookies: Cookies): boolean {
	return cookies.get(COOKIE_ADMIN) === process.env.ADMIN_KEY;
}
