import { ConfigStore } from '@zcatalyst/auth-client';
import { isNonEmptyString, isValidInputString, wrapValidators } from '@zcatalyst/utils';

import { CatalystPostgresError } from './error.js';

// `process` is absent in browsers, where the values come from the /sdk/init response
const env = (key: string): string | undefined =>
	(typeof process !== 'undefined' ? process.env?.[key] : undefined) || undefined;

// Browser only: cluster id and domain saved by `getCredentials()` from /sdk/init
const stored = (key: string): string | undefined =>
	(typeof window !== 'undefined' ? ConfigStore.get(key) : undefined) || undefined;

type AppWithConfig = { config?: { postgresId?: string; postgresDomain?: string } } | undefined;

/** Resolves the cluster id: env `CLUSTER_ID`, then the `x-zc-directdb-cluster-id` request header, then (browser) the `/sdk/init` value. */
export function resolveClusterId(app?: AppWithConfig): string {
	const clusterId = env('CLUSTER_ID') ?? app?.config?.postgresId ?? stored('CLUSTER_ID');
	wrapValidators(() => {
		isValidInputString(clusterId, 'cluster_id', true);
	}, CatalystPostgresError);
	return clusterId as string;
}

/** Resolves the query domain: env `POSTGRESS_DOMAIN`, then the `x-zc-directdb-pdomain` request header, then (browser) the `/sdk/init` value. */
export function resolveDomain(app?: AppWithConfig): string {
	const domain =
		env('POSTGRESS_DOMAIN') ??
		env('POSTGRES_DOMAIN') ??
		app?.config?.postgresDomain ??
		stored('POSTGRES_DOMAIN');
	wrapValidators(() => {
		isNonEmptyString(domain, 'postgres_domain', true);
	}, CatalystPostgresError);
	return (domain as string).replace(/\/+$/, '');
}
