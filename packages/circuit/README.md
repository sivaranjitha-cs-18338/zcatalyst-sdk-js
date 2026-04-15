# @zcatalyst/circuit

JavaScript SDK for Catalyst Circuit - API Gateway and Circuit Execution

## Overview

The `@zcatalyst/circuit` package provides JavaScript/TypeScript methods to execute [Catalyst Circuit](https://docs.catalyst.zoho.com/en/serverless/help/circuit/introduction/), a powerful API Gateway for building, managing, and exposing HTTP API endpoints. Circuit allows you to create managed APIs and integrate multiple Catalyst functions into workflows.

**Catalyst Circuit** acts as a gateway between your application's front-end and back-end logic, enabling you to orchestrate function executions and manage API routes efficiently.

### Key Features

- **API Gateway**: Create and manage RESTful API endpoints
- **Function Orchestration**: Chain multiple functions in workflows
- **Route Management**: Define custom API routes and paths
- **Access Control**: Manage permissions and authentication
- **High Performance**: Optimized for low latency
- **Request Handling**: Process HTTP requests with full control
- **Integration Hub**: Connect multiple services and functions
- **Custom Logic**: Execute circuits with dynamic parameters

### Use Cases

- Build managed REST APIs
- Orchestrate multi-step workflows
- Route requests to different functions
- Implement API versioning
- Create microservices architecture
- Handle complex business processes
- Aggregate data from multiple sources

### Prerequisites

- A [Catalyst project](https://docs.catalyst.zoho.com/en/getting-started/catalyst-projects) set up
- Circuit configured in your project
- Functions created for circuit execution
- Understanding of [circuit concepts](https://docs.catalyst.zoho.com/en/serverless/help/circuit/key-concepts/)

## Installation

To install this package, simply type add or install @zcatalyst/circuit
using your favorite package manager:

- `npm install @zcatalyst/circuit`
- `yarn add @zcatalyst/circuit`
- `pnpm add @zcatalyst/circuit`

## Getting Started

### Import

The Catalyst SDK is modularized by Components.
To send a request, you only need to import the `Circuit`:

```js
// ES5 example
const { Circuit } = require('@zcatalyst/circuit');
```

```ts
// ES6+ example
import { Circuit } from '@zcatalyst/circuit';
```

### Usage

To send a request, you:

- Create a Circuit Instance.
- Call the Circuit operation with input parameters.

```js
const circuit = new Circuit();

const result = await circuit.execute('195000000041001', 'sampleName', { name: 'Aaron Jone'});
```

#### Async/await

We recommend using [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
operator to wait for the promise returned by send operation as follows:

```js
try {
	const data = await circuit.execute('195000000041001', 'sampleName', { name: 'Aaron Jone'});
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
	const data = await circuit.execute('195000000041001', 'sampleName', { name: 'Aaron Jone'});
	// process data.
} catch (error) {
	const message = error.message;
	const status = error.statusCode;
	console.log({ message, status });
}
```

## Resources

- [Catalyst Circuit Documentation](https://docs.catalyst.zoho.com/en/serverless/help/circuit/introduction/)
- [Circuit Key Concepts](https://docs.catalyst.zoho.com/en/serverless/help/circuit/key-concepts/)
- [Circuit Configuration](https://docs.catalyst.zoho.com/en/serverless/help/circuit/circuit-config/)
- [Circuit SDK Reference](https://docs.catalyst.zoho.com/en/sdk/server-side-sdks/node-js-sdk/circuit/)
- [SDK Documentation](https://docs.catalyst.zoho.com/en/sdk/)

## Contributing

Contributions to this library are always welcome and highly encouraged.

See [CONTRIBUTING](../../CONTRIBUTING.md) for more information on how to get started.

## License

This SDK is distributed under the Apache License 2.0. See [LICENSE](../../LICENCE) file for more information.
