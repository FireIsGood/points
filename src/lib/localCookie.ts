// Taken from https://github.com/WhereCanI/svelte-cookie/blob/master/src/SvelteCookie.svelte
// because I don't wanna install a package for literally just these functions

export function getCookie(name: string) {
	let cookieName = name + '=';
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(cookieName) == 0) {
			return c.substring(cookieName.length, c.length);
		}
	}
	return null;
}

export function setCookie(name: string, value: string, exdays: number, secure: boolean) {
	const d = new Date();
	d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
	let expires = 'expires=' + d.toUTCString();
	document.cookie = `${name}=${value};${expires};path=/;${secure ? ' secure' : ''}`;
}

export function deleteCookie(name: string) {
	document.cookie = `${name}=; Max-Age=-99999999;`;
}
