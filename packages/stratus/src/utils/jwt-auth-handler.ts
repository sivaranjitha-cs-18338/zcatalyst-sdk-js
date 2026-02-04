import { Handler, IRequestConfig } from '@zcatalyst/transport';
import { CatalystService, CONSTANTS } from '@zcatalyst/utils';

import { Bucket } from '../bucket';
import { IJWTResponse } from './interface';

const { REQ_METHOD, CREDENTIAL_USER } = CONSTANTS;

export class JWTAuthHandler {
	bucket: Bucket;
	_requester: Handler;
	zaid: string = '';
	projectDomain: string = '';
	authPortal: string = '';
	cookie?: Record<string, string>;
	accessTokenObj: { access_token?: string; expires_in?: number } = {};
	constructor(bucket: Bucket) {
		this.bucket = bucket;
		this._requester = this.bucket.getAuthorizationClient();
	}

	async initializeConfig() {
		if (typeof window !== 'undefined') {
			this.projectDomain = sessionStorage.getItem('PROJECT_DOMAIN') as string;
			this.zaid = sessionStorage.getItem('ZAID') as string;
			this.authPortal = sessionStorage.getItem('IAM_DOMAIN') as string;
		} else {
			this.zaid = this._requester.app?.config.projectKey as string;
			this.projectDomain = this._requester.app?.config.projectDomain as string;
			this.authPortal = process.env.CATALYST_PORTAL_DOMAIN as string;
		}
	}

	async setCookie() {
		this.cookie = (await (this._requester as Handler).app?.credential.getToken()) as Record<
			string,
			string
		>;
	}

	async processJwtToken() {
		const res = await this.generateJwtToken();
		this.accessTokenObj = await this.convertJwtToToken(res);
		this.accessTokenObj.expires_in = (this.accessTokenObj.expires_in as number) + Date.now();
	}

	async getJWTAccessToken() {
		if (
			this.accessTokenObj?.access_token &&
			(this.accessTokenObj?.expires_in as number) > Date.now()
		) {
			return this.accessTokenObj.access_token;
		}
		await this.initializeConfig();
		if (typeof window !== 'undefined') {
			const { setToken, getToken } = await import('@zcatalyst/auth-client');
			const jwt = getToken('stratus_jwt') as unknown as Record<string, unknown>;
			if (!jwt) {
				await this.processJwtToken();
				setToken(this.accessTokenObj, 'stratus_jwt');
			}
			return jwt as unknown as string;
		} else {
			await this.processJwtToken();
		}
		return this.accessTokenObj.access_token;
	}

	async generateJwtToken(): Promise<IJWTResponse> {
		const option: IRequestConfig = {
			method: REQ_METHOD.get,
			path: `/authentication/custom-token`,
			service: CatalystService.BAAS,
			user: CREDENTIAL_USER.user
		};
		return (await (this._requester ? this._requester : new Handler()).send(option)).data.data;
	}

	async convertJwtToToken(
		jwtRes: IJWTResponse
	): Promise<{ access_token: string; expires_in: number }> {
		const option: IRequestConfig = {
			method: REQ_METHOD.post,
			headers: {
				Origin: this.projectDomain
			},
			qs: {
				response_type: 'remote_token',
				jwt_token: jwtRes.jwt_token,
				client_id: jwtRes.client_id,
				scope: jwtRes.scopes.join(' ')
			},
			origin: this.authPortal,
			auth: false,
			path: `/clientoauth/v2/${this.zaid}/remote/auth`,
			service: CatalystService.EXTERNAL
		};
		const res = (await new Handler().send(option)).data;
		return res;
	}
}
