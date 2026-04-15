#!/usr/bin/env node
'use strict';

/**
 * Cross-platform script to publish or unpublish all packages in the monorepo.
 * Usage:
 *   node scripts/publish-packages.js [--unpublish] [--registry <url>] [--tag <tag>]
 */

const { execSync } = require('child_process');
const { readdirSync, statSync } = require('fs');
const { join } = require('path');

const args = process.argv.slice(2);
const isUnpublish = args.includes('--unpublish');
const registryIndex = args.indexOf('--registry');
const tagIndex = args.indexOf('--tag');

const DEFAULT_REGISTRY =
	process.env.ZC_NPM_REGISTRY ||
	'http://crm-spm-u16.csez.zohocorpin.com:4873/';
const registry = registryIndex !== -1 ? args[registryIndex + 1] : DEFAULT_REGISTRY;
const tag = tagIndex !== -1 ? args[tagIndex + 1] : 'beta';

const packagesDir = join(__dirname, '..', 'packages');
const packages = readdirSync(packagesDir).filter((name) =>
	statSync(join(packagesDir, name)).isDirectory()
);

console.log(
	`${isUnpublish ? 'Unpublishing' : 'Publishing'} ${packages.length} package(s) to ${registry} ...\n`
);

let failed = 0;
for (const pkg of packages) {
	const pkgDir = join(packagesDir, pkg);
	try {
		if (isUnpublish) {
			execSync(`pnpm unpublish --registry ${registry}`, {
				cwd: pkgDir,
				stdio: 'inherit'
			});
		} else {
			execSync(`pnpm publish --registry ${registry} --no-git-checks --tag ${tag}`, {
				cwd: pkgDir,
				stdio: 'inherit'
			});
		}
	} catch (err) {
		console.error(`\nFailed for package: ${pkg}`);
		failed++;
	}
}

if (failed > 0) {
	console.error(`\n${failed} package(s) failed.`);
	process.exit(1);
} else {
	console.log('\nAll packages processed successfully.');
}
