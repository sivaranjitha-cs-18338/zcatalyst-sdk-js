# @zcatalyst/transport

HTTP Transport Layer for Catalyst SDK - Internal Communication Module

## Overview

The `@zcatalyst/transport` package provides a unified HTTP transport layer used internally by all Catalyst SDK packages. It handles HTTP/HTTPS communication between your application and Catalyst services.

**Catalyst Transport** is an infrastructure package that abstracts the HTTP client implementation for both Node.js (using built-in `http`/`https` modules) and browser environments (using Fetch API).

### Key Features

- **Unified API**: Single interface for Node.js and browser
- **Cross-Platform**: Works in Node.js and browser environments
- **Optimized**: Environment-specific implementations
- **Secure**: HTTPS support with proper certificate handling
- **Request Handling**: Headers, body, query parameters
- **Response Processing**: Automatic response parsing
- **Error Handling**: Consistent error responses

> **Note**: This is an internal infrastructure package used by other Catalyst SDK packages. Most developers won't need to use this directly - use the component-specific packages instead.

### Use Cases

- Custom integrations with Catalyst services
- Building new Catalyst SDK components
- Advanced HTTP request customization

### Prerequisites

- Typically installed as a dependency of other Catalyst packages
- Not required to be installed separately unless building custom integrations

## Installation

To install this package, simply type add or install @zcatalyst/transport
using your favorite package manager:

- `npm install @zcatalyst/transport`
- `yarn add @zcatalyst/transport`
- `pnpm add @zcatalyst/transport`

## Getting Started

### Import

The Catalyst SDK provides a unified HTTP transport layer for making API requests.
To use the transport handler, import the `Handler`:

```js
// ES5 example
const { Handler } = require("@zcatalyst/transport");
```

```ts
// ES6+ example
import { Handler } from "@zcatalyst/transport";
```

### Usage

#### Node.js Environment

For server-side HTTP requests using Node.js built-in modules:

```js
const handler = new Handler(app, component);

// Send HTTP request
const response = await handler.send({
  method: 'GET',
  url: '/api/data',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

#### Browser Environment

For client-side HTTP requests using Fetch API:

```js
const handler = new Handler(app, component);

// Send HTTP request
const response = await handler.send({
  method: 'POST',
  url: '/api/data',
  headers: {
    'Content-Type': 'application/json'
  },
  data: {
    name: 'example',
    value: 123
  }
});
```

### Request Configuration

The `send` method accepts an `IRequestConfig` object:

```js
const config = {
  method: 'POST',           // HTTP method: GET, POST, PUT, DELETE, etc.
  url: '/api/endpoint',      // API endpoint
  headers: {                 // HTTP headers
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  data: {                    // Request body (JSON)
    key: 'value'
  },
  params: {                  // URL query parameters
    page: 1,
    limit: 10
  },
  timeout: 30000,            // Request timeout in milliseconds
  retries: 3                 // Number of retry attempts
};
```

### Async/await

We recommend using [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
operator to wait for the promise returned by HTTP requests:

```js
// async/await.
try {
  const response = await handler.send(config);
  // process response.
} catch (error) {
  // error handling.
} finally {
  // finally.
}
```

### Error Handling

When the service returns an exception, the error will include the exception information,
as well as response metadata (e.g. request id).

```js
try {
  const response = await handler.send(config);
  // process response.
} catch (error) {
  const message = error.message;
  const status = error.statusCode;
  console.log({ message, status });
}
```

## API Reference

### Transport Operations

<details>
<summary>
Create Handler Instance
</summary>

```js
const handler = new Handler(app, component);
```

- `app`: Catalyst app instance (optional)
- `component`: Component instance for request context (optional)

</details>

<details>
<summary>
Send GET Request
</summary>

```js
const response = await handler.send({
  method: 'GET',
  url: '/api/users',
  params: {
    page: 1,
    limit: 10
  }
});
```

</details>

<details>
<summary>
Send POST Request
</summary>

```js
const response = await handler.send({
  method: 'POST',
  url: '/api/users',
  headers: {
    'Content-Type': 'application/json'
  },
  data: {
    name: 'John Doe',
    email: 'john@example.com'
  }
});
```

</details>

<details>
<summary>
Send PUT Request
</summary>

```js
const response = await handler.send({
  method: 'PUT',
  url: '/api/users/123',
  headers: {
    'Content-Type': 'application/json'
  },
  data: {
    name: 'Jane Doe',
    email: 'jane@example.com'
  }
});
```

</details>

<details>
<summary>
Send DELETE Request
</summary>

```js
const response = await handler.send({
  method: 'DELETE',
  url: '/api/users/123'
});
```

</details>

<details>
<summary>
Handle File Upload
</summary>

```js
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('description', 'Profile picture');

const response = await handler.send({
  method: 'POST',
  url: '/api/upload',
  headers: {
    'Content-Type': 'multipart/form-data'
  },
  data: formData
});
```

</details>

### Response Format

The response object contains:

```js
{
  data: {},              // Response data
  status: 200,           // HTTP status code
  statusText: 'OK',      // HTTP status text
  headers: {},           // Response headers
  config: {},            // Request configuration
  request: {}            // Request object
}
```

### Environment Support

This package automatically detects the environment and uses appropriate HTTP clients:

- **Node.js**: Uses built-in `http` and `https` modules
- **Browser**: Uses Fetch API

## Resources

- [Catalyst SDK Documentation](https://docs.catalyst.zoho.com/en/sdk/)
- [Catalyst API Reference](https://docs.catalyst.zoho.com/en/api/)
- [Node.js HTTP Module](https://nodejs.org/api/http.html)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## Contributing

Contributions to this library are always welcome and highly encouraged.

See [CONTRIBUTING](../../CONTRIBUTING.md) for more information on how to get started.

## License

This SDK is distributed under the Apache License 2.0. See [LICENSE](../../LICENCE) file for more information.
