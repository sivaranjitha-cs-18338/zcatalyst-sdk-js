export class ConfigStore {
	static set(key: string, value: string | number | object) {
		sessionStorage.setItem(key, value.toString());
	}

	static get(key: string): string | null {
		const item = sessionStorage.getItem(key);
		return item ? item : null;
	}

	static remove(key: string) {
		sessionStorage.removeItem(key);
	}

	static clear() {
		sessionStorage.clear();
	}
}
