import { Auth_Protocol } from './enums';
export interface CatalystFeature {
	readonly URL: string | null;
}

export interface jwtAccessTokenResponse {
	access_token: string;
}

export interface ICatalystSignInConfig {
	signInProvidersOnly?: boolean;
	signin_providers_only?: boolean;
	css_url?: string;
	is_customize_forgot_password?: boolean;
	forgot_password_id?: string;
	forgot_password_css_url?: string;
	service_url?: string;
	redirect_url?: string;
}
export interface PageAuth {
	login_page?: string;
	service_url?: string;
}

export interface BodyData {
	[key: string]: unknown; // allows any string as a key
}

export interface UserDataOptions {
	zaid?: string;
	zaaid?: string;
	platform?: string;
	redirect_url?: string;
	user_details?: UserDetails;
}

export interface UserDetails {
	name?: string;
	first_name?: string;
	last_name?: string;
	email_id?: string;
}

export interface CatalystFeature {
	readonly URL: string | null;
}

export interface jwtAccessTokenResponse {
	access_token: string;
}

export interface SimpleResponse {
	status: number;
	message: string;
	content: Record<string, string>;
}

export interface StrKeyStrValueType {
	[property: string]: string;
}
export interface RetryDetail {
	count: number;
	delay: number;
}

export interface NetFailRetries {
	[statusCode: number]: RetryDetail;
}

export interface SdkInfo {
	initialized: boolean;
	retries: {
		netFail: NetFailRetries;
	};
	pollInterval: number;
	pollThreshold: number;
	tokenExpiryTime: number;
}

export enum AuthProtocol {
	ZcrfTokenProtocol = 'ZcrfTokenProtocol',
	OAuth2 = 'OAuth2',
	JWT = 'JWT'
}

export interface ServiceInfo {
	catalystDomain: string;
	stratusDomain?: string;
	iamDomain: string;
	authProtocol: AuthProtocol;
	apiDomain: string;
	tokenPrefix: string;
	isAppSail?: string;
	environment?: string;
}

export interface Credentials {
	refreshToken?: string;
	clientId?: string;
	clientSecret?: string;
	redirectUri?: string;
	grantType?: string;
	authToken?: string;
	projectDomain?: string;
	projectId?: string;
	zaid?: string;
	csrfToken?: string;
	orgId?: string;
}

export interface JwtAuth {
	cookieTokenKey: string;
	cookieExpiryKey: string;
	fetchDetailsCallbackFn?: string | Function;
	clientId?: string;
	jwtToken?: string;
	tokenPrefix?: string;
	authToken?: string;
	responseType: string;
	tokenExpiry: number;
}

export interface UserInfo {
	credentials: Credentials;
	jwtAuth: JwtAuth;
	currentClientPageHost: string;
	currentClientPageProtocol: string;
	currentClientPagePort: string;
	currentClientPageOrigin: string;
	currentClientPageHref: string;
	currentClientPathName: string;
}

export interface CatalystConfig {
	sdkInfo: SdkInfo;
	serviceInfo: ServiceInfo;
	userInfo: UserInfo;
}
