/**
 * Release Packages Script
 * 
 * Purpose:
 * This script automates the publishing of changed packages to npm registry.
 * It identifies packages that have been modified since the last git tag and
 * publishes only those packages, avoiding unnecessary releases.
 * 
 * Workflow:
 * 1. Retrieves the latest git tag to establish a baseline
 * 2. Compares current HEAD with the latest tag to find changed files
 * 3. Maps changed files to their respective packages in the monorepo
 * 4. Publishes only the packages that have changes
 * 
 * Requirements:
 * - NPM_TOKEN environment variable must be set for authentication
 * - NPM_REGISTRY environment variable (optional, defaults to registry.npmjs.org)
 * - Git repository with at least one tag (or publishes all packages if no tags exist)
 * 
 * Usage:
 * node scripts/release-packages.js
 * 
 * Note: This script is typically run in CI/CD pipelines after version updates
 */

const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

function getChangedFilesSinceLatestTag() {
  const tag = getLatestTag();
  const range = tag ? `${tag}..HEAD` : 'HEAD';
  const output = execSync(`git diff --name-only ${range}`, { encoding: 'utf-8' });
  return output.split('\n').filter(Boolean);
}


function getLatestTag() {
  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
}

function getAllPackages() {
  const rootPkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  const workspaces = rootPkg.workspaces || rootPkg.pnpm?.packages || ['packages/*'];

  const pkgs = [];
  for (const pattern of workspaces) {
    const dirs = execSync(`find ${pattern} -name package.json`, { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean)
      .map(pkgJson => join(pkgJson, '..'));
    pkgs.push(...dirs);
  }
  return pkgs;
}

function getChangedPackagesByDiff(changedFiles, allPackages) {
  return allPackages.filter(pkgPath => {
    return changedFiles.some(file => file.startsWith(pkgPath));
  });
}

function publish(path) {
  try {
    const token = process.env.NPM_TOKEN;
    const registry = process.env.NPM_REGISTRY || 'registry.npmjs.org';
    if (!token) throw new Error('NPM_TOKEN is not set');

    writeFileSync(
      join(path, '.npmrc'),
      `//${registry}:_authToken=${token}\nregistry=https://${registry}`,
      'utf8'
    );

    console.log('rc file created for', readFileSync(join(path, '.npmrc'), 'utf-8'));

    const pkg = JSON.parse(readFileSync(join(path, 'package.json'), 'utf-8'));
    console.log(`Publishing ${pkg.name} (${pkg.version})...`);
    execSync(`pnpm publish --no-git-checks`, { cwd: path, stdio: 'inherit' });
    console.log(`Published ${pkg.name}@${pkg.version}`);
  } catch (err) {
    throw new Error(`Failed to publish ${path}: ${err.message}`);
  }
}

const tag = getLatestTag();
console.log(`Latest tag: ${tag || 'none'}`);

const changedFiles = getChangedFilesSinceLatestTag();
console.log('Changed files since last tag:', changedFiles);

const allPackages = getAllPackages();
const changedPackages = getChangedPackagesByDiff(changedFiles, allPackages);

if (changedPackages.length === 0) {
  console.log('No matching packages found for changed files.');
  process.exit(0);
}

for (const pkgPath of changedPackages) {
  publish(pkgPath);
}
