# @zcatalyst/auth-admin

JavaScript SDK for Catalyst Admin Authentication - Server-Side Admin Operations

## Overview

The `@zcatalyst/auth-admin` package provides server-side authentication methods for Catalyst applications, enabling administrative operations and project initialization in Node.js environments.

**Admin Authentication** allows your backend code to authenticate with Catalyst using project credentials, enabling full access to Catalyst services and administrative operations.

This package is designed specifically for **Node.js environments only** and will not work in browser environments. For browser authentication, use `@zcatalyst/auth` instead.

### Key Features

- **Project Authentication**: Initialize with project credentials
- **Admin Access**: Full administrative capabilities
- **Environment Config**: Support for dev/production environments
- **Credential Management**: Secure project key handling
- **Domain Configuration**: Custom domain support
- **SDK Initialization**: Initialize Catalyst app instances
- **Secure**: Server-side only authentication

### Use Cases

- Backend service initialization
- Administrative script execution
- Scheduled job authentication
- Function-to-function calls
- Server-side data operations
- Automated workflows
- Testing and development

### Prerequisites

- A [Catalyst project](https://docs.catalyst.zoho.com/en/getting-started/catalyst-projects) set up
- Project credentials (ID, Key, Secret)
- Node.js environment (server-side only)

## Installation

To install this package, simply type add or install @zcatalyst/auth-admin
using your favorite package manager:

- `npm install @zcatalyst/auth-admin`
- `yarn add @zcatalyst/auth-admin`
- `pnpm add @zcatalyst/auth-admin`

## Getting Started

### Import

The Catalyst SDK is modularized by Components.
To handle admin authentication, you only need to import the `ZCAuth`:

```js
// CommonJS
const { ZCAuth } = require("@zcatalyst/auth-admin");
```

```ts
// ES6+
import { ZCAuth } from "@zcatalyst/auth-admin";
```

### Usage

#### Initialize Admin Authentication

```js
const auth = new ZCAuth();

// Initialize with project credentials
await auth.init({
  projectId: 'your_project_id',
  projectKey: 'your_project_key',
  environment: 'development'
});
```

#### Environment Variables

You can also configure authentication using environment variables:

```bash
export ZCATALYST_PROJECT_ID=your_project_id
export ZCATALYST_PROJECT_KEY=your_project_key
export ZCATALYST_ENVIRONMENT=development
export ZCATALYST_PROJECT_DOMAIN=catalyst.zoho.com
export ZCATALYST_PROJECT_SECRET_KEY=your_secret_key
```

Then initialize without parameters:

```js
const auth = new ZCAuth();
await auth.init();
```

### Async/await

We recommend using [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
operator to wait for the promise returned by authentication operations:

```js
try {
  await auth.init(credentials);
} catch (error) {
  // error handling
} finally {
  // cleanup
}
```

### Error Handling

When the service returns an exception, the error will include the exception information,
as well as response metadata (e.g. request id).

```js
try {
  await auth.init(credentials);
} catch (error) {
  const message = error.message;
  const status = error.statusCode;
  console.log({ message, status });
}
```

## API Reference

<details>
<summary>
<strong>init(options)</strong> - Initialize Authentication
</summary>

```js
const auth = new ZCAuth();
await auth.init({
  projectId: 'your_project_id',
  projectKey: 'your_project_key',
  environment: 'development',
  type: 'auto',
  appName: 'my-app',
  scope: 'admin'
});
```

</details>

<details>
<summary>
<strong>app(name)</strong> - Get App Instance
</summary>

```js
const app = await auth.app('your_app_name');
```

</details>

<details>
<summary>
<strong>getDefaultCredentials()</strong> - Get Default Credentials
</summary>

```js
const credentials = ZCAuth.getDefaultCredentials();
```

</details>

## Resources

- [Catalyst Authentication Documentation](https://docs.catalyst.zoho.com/en/security/help/authentication/introduction/)
- [Admin Authentication](https://docs.catalyst.zoho.com/en/security/help/authentication/admin-auth/)
- [Project Credentials](https://docs.catalyst.zoho.com/en/getting-started/catalyst-projects/)
- [Authentication SDK Reference](https://docs.catalyst.zoho.com/en/sdk/server-side-sdks/node-js-sdk/authentication/)
- [SDK Documentation](https://docs.catalyst.zoho.com/en/sdk/)

## Contributing

Contributions to this library are always welcome and highly encouraged.

See [CONTRIBUTING](../../CONTRIBUTING.md) for more information on how to get started.

## License

This SDK is distributed under the Apache License 2.0. See [LICENSE](../../LICENCE) file for more information.
