# @zcatalyst/connector

JavaScript SDK for Catalyst Connector - Third-Party Integration Management

## Overview

The `@zcatalyst/connector` package provides JavaScript/TypeScript methods to interact with [Catalyst Connector](https://docs.catalyst.zoho.com/en/serverless/help/connector/introduction/), a service for seamlessly integrating third-party applications and APIs with your Catalyst application using OAuth 2.0 authentication.

**Catalyst Connector** simplifies OAuth flow management by handling token generation, storage, and refresh automatically, allowing you to focus on integration logic rather than authentication mechanics.

### Key Features

- **OAuth 2.0 Management**: Automatic token handling and refresh
- **Third-Party Integration**: Connect with external APIs easily
- **Auto Token Refresh**: Automatic refresh token management
- **Secure Storage**: Encrypted token storage
- **API Communication**: Simplified API request handling
- **Configuration Management**: Store connector configurations
- **Multiple Services**: Connect multiple external services
- **Zoho Integration**: Pre-configured Zoho service connectors

### Use Cases

- Integrate with Zoho services (CRM, Books, Desk, etc.)
- Connect with external APIs (Google, GitHub, Salesforce)
- Automate data synchronization
- Implement social login
- Access third-party services securely
- Build integration workflows
- Manage multiple API connections

### Prerequisites

- A [Catalyst project](https://docs.catalyst.zoho.com/en/getting-started/catalyst-projects) set up
- OAuth credentials from third-party service
- Connector configured in Catalyst Console
- Understanding of [OAuth 2.0 flow](https://docs.catalyst.zoho.com/en/serverless/help/connector/oauth-configuration/)

## Installation

To install this package, simply type add or install @zcatalyst/connector
using your favorite package manager:

- `npm install @zcatalyst/connector`
- `yarn add @zcatalyst/connector`
- `pnpm add @zcatalyst/connector`

## Getting Started

### Import

The Catalyst SDK is modularized by Components.
To send a request, you only need to import the `Connector`:

```js
// ES5 example
const { Connector } = require('@zcatalyst/connector');
```

```ts
// ES6+ example
import { Connector } from '@zcatalyst/connector';
```

### Usage

To send a request, you:

- Create a Connector Instance.
- Call the Connector operation with input parameters.

```js
const connector = new Connector({
	ConnectorName: {
		client_id: '{add_client_id}',
		client_secret: '{add_client_secret}',
		auth_url: '{add_auth_url}',
		refresh_url: '{add_refresh_url}',
		refresh_token: '{add_refresh_token}'
	}
});

const connectorInstance = await connector.getConnector('ConnectorName');
```

#### Async/await

We recommend using [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
operator to wait for the promise returned by send operation as follows:

```js
try {
	const connectorInstance = await connector.getConnector('ConnectorName');
	const data = await connectorInstance.getAccessToken();
	// process data.
} catch (error) {
	// error handling.
} finally {
	// finally.
}
```

Async-await is clean, concise, intuitive, easy to debug and has better error handling
as compared to using Promise chains or callbacks.

### Error Handling

When the service returns an exception, the error will include the exception information,
as well as response metadata (e.g. request id).

```js
try {
	const data = await connector.getAccessToken();
	// process data.
} catch (error) {
	const message = error.message;
	const status = error.statusCode;
	console.log({ message, status });
}
```

## Resources

- [Catalyst Connector Documentation](https://docs.catalyst.zoho.com/en/serverless/help/connector/introduction/)
- [OAuth Configuration](https://docs.catalyst.zoho.com/en/serverless/help/connector/oauth-configuration/)
- [Connector Management](https://docs.catalyst.zoho.com/en/serverless/help/connector/connector-management/)
- [Connector SDK Reference](https://docs.catalyst.zoho.com/en/sdk/server-side-sdks/node-js-sdk/connector/)
- [SDK Documentation](https://docs.catalyst.zoho.com/en/sdk/)

## Contributing

Contributions to this library are always welcome and highly encouraged.

See [CONTRIBUTING](../../CONTRIBUTING.md) for more information on how to get started.

## License

This SDK is distributed under the Apache License 2.0. See [LICENSE](../../LICENCE) file for more information.
