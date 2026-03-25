export async function clipboardCopy(data: string): Promise<boolean> {
	if ('clipboard' in navigator) {
		await navigator.clipboard.writeText(data);
		return true;
	}
	return false;
}

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 360;
export function wayLaterTimestamp(): Date {
	return new Date(new Date().getTime() + ONE_YEAR_IN_SECONDS);
}
