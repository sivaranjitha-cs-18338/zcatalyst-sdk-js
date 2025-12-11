export class ConfigStore {
	static has(key: string): boolean {
		return sessionStorage.getItem(key) !== null;
	}

	static set(key: string, value: string | number | object) {
		sessionStorage.setItem(key, value.toString());
	}

	static get(key: string): string | undefined {
		const value = sessionStorage.getItem(key);
		return value !== null ? value : undefined;
	}

	static clear() {
		sessionStorage.clear();
	}
}
