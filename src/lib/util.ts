export async function clipboardCopy(data: string): Promise<boolean> {
	if ('clipboard' in navigator) {
		await navigator.clipboard.writeText(data);
		return true;
	}
	return false;
}
