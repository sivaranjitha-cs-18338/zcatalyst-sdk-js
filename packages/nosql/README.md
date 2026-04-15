# @zcatalyst/nosql

JavaScript SDK for Catalyst NoSQL - Non-Relational Database Management

## Overview

The `@zcatalyst/nosql` package provides JavaScript/TypeScript methods to interact with [Catalyst NoSQL](https://docs.catalyst.zoho.com/en/cloud-scale/help/nosql/introduction/), a fully-managed, non-relational database for handling unstructured and semi-structured data. NoSQL is part of Catalyst Cloud Scale services powered by a highly scalable proprietary infrastructure.

**Catalyst NoSQL** uses key-value pair based document-type storage with support for [Custom JSON format](https://docs.catalyst.zoho.com/en/cloud-scale/help/nosql/working-with-data/introduction/#the-catalyst-custom-json-format) and multiple data types. It offers high-volume storage with multi-level scalability through data partitioning across clusters.

### Key Features

- **Document Storage**: Key-value pair based JSON document storage
- **Flexible Schema**: Schema-less design - items need not follow the same structure
- **High Scalability**: Vertical and horizontal scaling with distributed storage
- **Multiple Data Types**: Support for string, number, boolean, array, map, and more
- **Write-Heavy Systems**: Optimized for high write throughput with peer-to-peer replication
- **Query Search**: Powerful query capabilities for document retrieval
- **Partitioned Storage**: Data distribution across clusters for better performance
- **No Relationships**: Independent data entities without inter-dependencies

### Use Cases

Choose NoSQL if:
- Your data is **unstructured or semi-structured** and cannot fit tabular format
- You need **flexible schema** that can change dynamically
- Data points are **independent** without relationships
- You're building a **write-heavy system** requiring high throughput
- **Horizontal scalability** and distributed storage are priorities
- Your data is primarily in **JSON format**

> **Alternative**: For structured relational data, use [@zcatalyst/datastore](https://www.npmjs.com/package/@zcatalyst/datastore) instead. See [comparison guide](https://docs.catalyst.zoho.com/en/cloud-scale/help/nosql/introduction/#catalyst-data-store-vs-nosql).

### Prerequisites

- A [Catalyst project](https://docs.catalyst.zoho.com/en/getting-started/catalyst-projects) set up
- NoSQL tables created in your project
- Understanding of [NoSQL components and concepts](https://docs.catalyst.zoho.com/en/cloud-scale/help/nosql/components/)

## Installation

To install this package, simply type add or install @zcatalyst/nosql
using your favorite package manager:

- `npm install @zcatalyst/nosql`
- `yarn add @zcatalyst/nosql`
- `pnpm add @zcatalyst/nosql`

## Getting Started

### Import

The Catalyst SDK is modularized by Components.
To send a request, you only need to import the `NoSQL`:

```js
// ES5 example
const { NoSQL } = require('@zcatalyst/nosql');
```

```ts
// ES6+ example
import { NoSQL, NoSQLItem } from '@zcatalyst/nosql';
```

### Usage

To send a request, you:

- Create a NoSQL Instance.
- Call the NoSQL operation with input parameters.

```js
const nosql = new NoSQL();
const item = new NoSQLItem();

item.addString('fruit', 'mango')
	// Add a map
	.addMap('properties', {
		color: 'yellow'
	});
const table = await nosql.getTable('124567890');
```

### Async/await

We recommend using [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
operator to wait for the promise returned by send operation as follows:

```js
try {
	const data = await table.insertItems({
		item: NoSQLItem.from({
			fruitName: 'Banana',
			fruitProperties: {
				fruitColor: 'Yellow',
				fruitType: 'Berries'
			}
		}),
		return: NoSQLReturnValue.NEW
	});
	// process data.
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
	const data = await table.insertItems({
		item: NoSQLItem.from({
			fruitName: 'Banana',
			fruitProperties: {
				fruitColor: 'Yellow',
				fruitType: 'Berries'
			}
		}),
		return: NoSQLReturnValue.NEW
	});
	// process data.
} catch (error) {
	const message = error.message;
	const status = error.statusCode;
	console.log({ message, status });
}
```

## Resources

- [Catalyst NoSQL Documentation](https://docs.catalyst.zoho.com/en/cloud-scale/help/nosql/introduction/)
- [NoSQL vs Data Store](https://docs.catalyst.zoho.com/en/cloud-scale/help/nosql/introduction/#catalyst-data-store-vs-nosql)
- [Custom JSON Format](https://docs.catalyst.zoho.com/en/cloud-scale/help/nosql/working-with-data/introduction/#the-catalyst-custom-json-format)
- [NoSQL Components](https://docs.catalyst.zoho.com/en/cloud-scale/help/nosql/components/)
- [NoSQL SDK Reference](https://docs.catalyst.zoho.com/en/sdk/server-side-sdks/node-js-sdk/nosql/)
- [SDK Documentation](https://docs.catalyst.zoho.com/en/sdk/)

## Contributing

Contributions to this library are always welcome and highly encouraged.

See [CONTRIBUTING](../../CONTRIBUTING.md) for more information on how to get started.

## License

This SDK is distributed under the Apache License 2.0. See [LICENSE](../../LICENCE) file for more information.
