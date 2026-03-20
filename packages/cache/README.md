# @zcatalyst/cache

JavaScript SDK for Catalyst Cache - High-Performance In-Memory Storage

## Overview

The `@zcatalyst/cache` package provides JavaScript/TypeScript methods to interact with [Catalyst Cache](https://docs.catalyst.zoho.com/en/cloud-scale/help/cache/introduction/), a high-performance in-memory storage component for faster data retrieval. Cache is part of Catalyst Cloud Scale services.

**Catalyst Cache** is designed to store ephemeral data or frequently accessed information with sub-millisecond response times, reducing load on primary databases and significantly enhancing application performance.

### Key Features

- **Sub-millisecond Access**: Ultra-fast data retrieval from memory
- **High Performance**: Handles large data volumes with minimal latency
- **Segment Management**: Partition cache into logical segments
- **TTL Support**: Time-to-live for automatic data expiration
- **In-Memory Storage**: Independent service alongside main data storage
- **Scalable**: Handle dynamic loads in real-time applications
- **Key-Value Store**: Simple key-value pair storage model
- **Console Management**: Manage cache items directly from console

### Use Cases

- **Session Storage**: Store user session data for quick access
- **API Response Caching**: Cache frequent API responses
- **Database Query Results**: Store frequently accessed query results
- **Rate Limiting**: Track API rate limits and quotas
- **Temporary Data**: Store short-lived application state
- **Real-time Applications**: Support memory-intensive microservices
- **Performance Optimization**: Reduce database load for hot data

### Prerequisites

- A [Catalyst project](https://docs.catalyst.zoho.com/en/getting-started/catalyst-projects) set up
- Cache segments created in your project
- Understanding of [cache concepts](https://docs.catalyst.zoho.com/en/cloud-scale/help/cache/key-concepts/) and [architecture](https://docs.catalyst.zoho.com/en/cloud-scale/help/cache/architecture/)

## Installation

To install this package, simply type add or install @zcatalyst/cache
using your favorite package manager:

- `npm install @zcatalyst/cache`
- `yarn add @zcatalyst/cache`
- `pnpm add @zcatalyst/cache`

## Getting Started

### Import

The Catalyst SDK is modularized by Components.
To send a request, you only need to import the `Cache`:

```js
// ES5 example
const { Cache } = require('@zcatalyst/cache');
```

```ts
// ES6+ example
import { Cache } from '@zcatalyst/cache';
```

### Usage

To send a request, you:

- Create a Cache Instance.
- Call the Cache operation with input parameters.

```js
const cache = new Cache();

// Get a segment instance (no await needed)
const segment = cache.segment('segment-id');

// Or get segment details (requires await)
const segmentDetails = await cache.getSegmentDetails('segment-id');
```

#### Async/await

We recommend using [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
operator to wait for the promise returned by send operation as follows:

```js
try {
	const segment = cache.segment('segment-id');
	const data = await segment.getValue('Age');
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
	const data = await segment.getValue('Age');
	// process data.
} catch (error) {
	const message = error.message;
	const status = error.statusCode;
	console.log({ message, status });
}
```

## Resources

- [Catalyst Cache Documentation](https://docs.catalyst.zoho.com/en/cloud-scale/help/cache/introduction/)
- [Cache Key Concepts](https://docs.catalyst.zoho.com/en/cloud-scale/help/cache/key-concepts/)
- [Cache Architecture](https://docs.catalyst.zoho.com/en/cloud-scale/help/cache/architecture/)
- [Cache Segments](https://docs.catalyst.zoho.com/en/cloud-scale/help/cache/segments/)
- [Cache SDK Reference](https://docs.catalyst.zoho.com/en/sdk/server-side-sdks/node-js-sdk/cache/)
- [SDK Documentation](https://docs.catalyst.zoho.com/en/sdk/)

## Contributing

Contributions to this library are always welcome and highly encouraged.

See [CONTRIBUTING](../../CONTRIBUTING.md) for more information on how to get started.

## License

This SDK is distributed under the Apache License 2.0. See [LICENSE](../../LICENCE) file for more information.
