# @zcatalyst/auth-client

JavaScript SDK for Catalyst Client Authentication - User Sign-In and Token Management

## Overview

The `@zcatalyst/auth-client` package provides client-side authentication methods for Catalyst applications, handling user sign-in, token management, and session handling.

**Client Authentication** enables secure user authentication flows in both browser and Node.js environments, managing authentication tokens and user sessions automatically.

### Key Features

- **User Sign-In**: Handle user authentication flows
- **Token Management**: Automatic token storage and refresh
- **Session Handling**: Persistent user sessions
- **Cross-Platform**: Works in browser and Node.js
- **Secure**: OAuth 2.0 based authentication
- **Auto Refresh**: Automatic token renewal
- **Client-Side**: Optimized for client applications

### Use Cases

- User login/logout flows
- Single sign-on (SSO)
- Session management
- Protected route authentication
- Client-side API calls
- User identity verification

### Prerequisites

- A [Catalyst project](https://docs.catalyst.zoho.com/en/getting-started/catalyst-projects) set up
- [Authentication configured](https://docs.catalyst.zoho.com/en/security/help/authentication/introduction/)
- Client credentials if using OAuth

## Installation

```bash
npm install @zcatalyst/auth-client
```

## Getting Started

Import the `AuthClient` module and use its methods as needed:

```js
const { zcAuth } = require('@zcatalyst/auth-client');
```

### Async/await

```js
try {
  const token = await zcAuth.signIn('id', {});
  console.log('Authentication successful:', token);
} catch (err) {
  console.error('Authentication failed:', err);
}
```

## Resources

- [Catalyst Authentication Documentation](https://docs.catalyst.zoho.com/en/security/help/authentication/introduction/)
- [User Authentication](https://docs.catalyst.zoho.com/en/security/help/authentication/user-auth/)
- [OAuth Configuration](https://docs.catalyst.zoho.com/en/security/help/authentication/oauth-config/)
- [Authentication SDK Reference](https://docs.catalyst.zoho.com/en/sdk/server-side-sdks/node-js-sdk/authentication/)
- [SDK Documentation](https://docs.catalyst.zoho.com/en/sdk/)

## Contributing

Contributions to this library are always welcome and highly encouraged.

See [CONTRIBUTING](../../CONTRIBUTING.md) for more information on how to get started.

## License

This SDK is distributed under the Apache License 2.0. See [LICENSE](../../LICENCE) file for more information.
