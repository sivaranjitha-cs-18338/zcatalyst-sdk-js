import { ConfigStore } from './config-store';
import {
	API_DOMAIN,
	CSRF_TOKEN,
	CSRF_TOKEN_KEY,
	defaultConfig,
	ENVIRONMENT,
	IAM_DOMAIN,
	INITIALIZED,
	IS_APPSAIL,
	ORG_ID,
	PROJECT_DOMAIN,
	PROJECT_ID,
	REQUIREMENT,
	STRATUS_DOMAIN,
	URL_DIVIDER,
	ZAID
} from './utils/constants';
import { Auth_Protocol } from './utils/enums';
import { CatalystAuthError } from './utils/errors';
import { setGlobal } from './utils/functions';
import { CatalystConfig } from './utils/interfaces';

export async function getCredentials() {
	try {
		setDefaultProjectConfig();
		const response = await fetch(`/${URL_DIVIDER.RESERVED_URL}/sdk/init`, {
			headers: {
				Accept: 'application/json'
			}
		});

		const credentials = await response.json();

		// Handle nested credential structure
		const finalCredentials = credentials.hasOwnProperty('credentialQR')
			? (credentials.credentialQR as CatalystConfig)
			: credentials;

		// Validate required properties
		validateRequiredCredentials(finalCredentials);

		ConfigStore.set(
			STRATUS_DOMAIN,
			`-${finalCredentials.environment}${finalCredentials.stratus_suffix}`
		);
		ConfigStore.set(API_DOMAIN, finalCredentials.api_domain);
		ConfigStore.set(ZAID, finalCredentials.zaid);
		ConfigStore.set(PROJECT_ID, finalCredentials.project_id);
		ConfigStore.set(IAM_DOMAIN, finalCredentials.auth_domain);
		ConfigStore.set(ENVIRONMENT, finalCredentials.environment);
		ConfigStore.set(IS_APPSAIL, finalCredentials.is_appsail);
		ConfigStore.set(PROJECT_DOMAIN, finalCredentials.project_domain);
		if (finalCredentials.org_id) {
			ConfigStore.set(ORG_ID, finalCredentials.org_id);
		}
		ConfigStore.set(INITIALIZED, true + '');
		setGlobal('__catalyst', finalCredentials);
	} catch (error) {
		throw new CatalystAuthError(
			'CREDENTIAL_FETCH_ERROR',
			`Failed to fetch credentials: ${error instanceof Error ? error.message : 'Unknown error'}`,
			500
		);
	}
}

export function setDefaultProjectConfig() {
	for (const [key, value] of Object.entries(defaultConfig)) {
		if (value !== undefined && value !== null) {
			ConfigStore.set(String(key), value as unknown as string);
		} else {
			ConfigStore.set(String(key), '');
		}
	}
}

/**
 * Validates required credential properties
 */
function validateRequiredCredentials(credentialJson: CatalystConfig): void {
	for (const requirement of REQUIREMENT.INIT_REQUIRE) {
		if (!credentialJson.hasOwnProperty(requirement)) {
			throw new CatalystAuthError(
				'PROPERTY_NOT_FOUND',
				`Missing required property: ${requirement}`,
				400
			);
		}
	}
}

export function addDefaultAppHeaders(headers: Record<string, string> = {}) {
	const normalizedHeaders = headers as Record<string, string>;
	// Modify the "Accept" header
	const currentAccept = normalizedHeaders['Accept'];
	if (!currentAccept) {
		normalizedHeaders['Accept'] = 'application/vnd.catalyst.v2+json';
	} else {
		normalizedHeaders['Accept'] = `application/vnd.catalyst.v2+json, ${currentAccept}`;
	}
	normalizedHeaders['CATALYST-COMPONENT'] = 'true';

	const orgId = ConfigStore.get(ORG_ID);
	if (orgId) {
		normalizedHeaders['CATALYST-ORG'] = orgId;
	}

	return normalizedHeaders;
}

export function getToken(key?: string) {
	let jwtAuthToken = '';
	const cookies = document.cookie.split(';');
	const cookiesLen = cookies.length;
	for (let i = 0; i < cookiesLen; i++) {
		const keyValuePairSplitted = cookies[i].split('=');
		if (keyValuePairSplitted[0].trim() === (key ? key : 'cookie')) {
			jwtAuthToken = keyValuePairSplitted[1];
		}
	}
	return jwtAuthToken;
}

export function setToken(authObj: { access_token?: string; expires_in?: number }, key?: string) {
	document.cookie = `${key ? key : 'cookie'}=${authObj.access_token}; max-age=${authObj.expires_in}; path=/`;
}

export async function collectZCRFToken(): Promise<unknown> {
	return new Promise((resolve, reject) => {
		try {
			const cookies: Array<string> = document.cookie.split(';');
			for (const cookie of cookies) {
				const keyVal = cookie.split('=');
				if (
					keyVal.length === 2 &&
					keyVal[0].trim() === CSRF_TOKEN_KEY &&
					keyVal[1].trim().length > 0
				) {
					ConfigStore.set(CSRF_TOKEN, keyVal[1].trim());
					resolve('success');
					return;
				}
			}
			resolve('success');
		} catch (e) {
			resolve('success');
		}
	});
}

export { Auth_Protocol, ConfigStore };
export * from './utils/constants';
