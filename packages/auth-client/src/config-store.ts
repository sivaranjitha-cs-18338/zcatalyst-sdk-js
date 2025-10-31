export class ConfigStore {
	static set(key: string, value: string | number | object) {
		sessionStorage.setItem(key, JSON.stringify(value));
	}

	static get<T = string>(key: string): T | null {
		const item = sessionStorage.getItem(key);
		return item ? JSON.parse(item) : null;
	}

	static remove(key: string) {
		sessionStorage.removeItem(key);
	}

	static clear() {
		sessionStorage.clear();
	}
}
