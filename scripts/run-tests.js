#!/usr/bin/env node

/**
 * Test Runner Script
 * 
 * Runs tests for common packages and all component packages
 * in the correct order to ensure dependencies are tested first.
 */

const { execSync } = require('child_process');
const path = require('path');

const COMMON_PACKAGES = [
  'utils',
  'transport',
  'auth-client',
  'auth-admin',
  'auth'
];

const COMPONENT_PACKAGES = [
  'cache',
  'datastore',
  'filestore',
  'cron',
  'zia',
  'functions',
  'push-notification',
  'email',
  'connections'
];

function runTests(packages, label) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Running ${label} Tests`);
  console.log(`${'='.repeat(50)}\n`);

  for (const pkg of packages) {
    try {
      console.log(`\nTesting @zcatalyst/${pkg}...`);
      execSync(`pnpm --filter @zcatalyst/${pkg} test`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      console.log(`✓ @zcatalyst/${pkg} tests passed`);
    } catch (error) {
      console.error(`✗ @zcatalyst/${pkg} tests failed`);
      process.exit(1);
    }
  }
}

// Run common packages first
runTests(COMMON_PACKAGES, 'Common Packages');

// Then run component packages
runTests(COMPONENT_PACKAGES, 'Component Packages');

console.log('\n' + '='.repeat(50));
console.log('All tests passed! ✓');
console.log('='.repeat(50) + '\n');
