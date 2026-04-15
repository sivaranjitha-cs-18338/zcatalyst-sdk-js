# @zcatalyst/search

JavaScript SDK for Catalyst Search - Full-Text Search Across Data Store

## Overview

The `@zcatalyst/search` package provides JavaScript/TypeScript methods to perform [Catalyst Search](https://docs.catalyst.zoho.com/en/cloud-scale/help/search/introduction/) operations, enabling full-text search across indexed columns in Data Store tables.

**Catalyst Search** provides fast, efficient search capabilities across large datasets with support for wildcard queries and multi-table searches.

### Key Features

- **Full-Text Search**: Search across indexed table columns
- **Fast Results**: Optimized for quick search response
- **Wildcard Support**: Use wildcard patterns in queries
- **Multi-Table Search**: Search across multiple tables simultaneously
- **Column Targeting**: Specify exact columns to search
- **Case-Insensitive**: Search regardless of case
- **Scalable**: Handle large datasets efficiently
- **Simple API**: Easy-to-use search methods

### Use Cases

- Implement site-wide search functionality
- Search user data across multiple tables
- Find records matching specific patterns
- Build autocomplete features
- Filter and discover data quickly
- Search logs and records
- Implement product search

### Prerequisites

- A [Catalyst project](https://docs.catalyst.zoho.com/en/getting-started/catalyst-projects) set up
- Data Store tables with indexed columns
- Understanding of [search indexing](https://docs.catalyst.zoho.com/en/cloud-scale/help/search/search-indexing/)

## Installation

To install this package, simply type add or install @zcatalyst/search
using your favorite package manager:

- `npm install @zcatalyst/search`
- `yarn add @zcatalyst/search`
- `pnpm add @zcatalyst/search`

## Getting Started

### Import

The Catalyst SDK is modularized by Components.
To send a request, you only need to import the `Search`:

```js
// ES5 example
const { Search } = require('@zcatalyst/search');
```

```ts
// ES6+ example
import { Search } from '@zcatalyst/search';
```

### Usage

To send a request, you:

- Create a Search Instance.
- Call the Search operation with input parameters.

```js
const search = new Search();

const data = await search.executeSearchQuery({
	search: 'santh\*',
	search_table_columns: {
		SampleTable: ['SearchIndexedColumn'],
		Users: ['SearchTest']
	}
});
```

### Async/await

We recommend using [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
operator to wait for the promise returned by send operation as follows:

```js
// async/await.
try {
	const search = new Search();
	const data = await search.executeSearchQuery({
		search: 'santh\*',
		search_table_columns: {
			SampleTable: ['SearchIndexedColumn'],
			Users: ['SearchTest']
		}
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
	const data = await search.executeSearchQuery({
		search: 'santh\*',
		search_table_columns: {
			SampleTable: ['SearchIndexedColumn'],
			Users: ['SearchTest']
		}
	});
	// process data.
} catch (error) {
	const message = error.message;
	const status = error.statusCode;
	console.log({ message, status });
}
```

## Resources

- [Catalyst Search Documentation](https://docs.catalyst.zoho.com/en/cloud-scale/help/search/introduction/)
- [Search Indexing](https://docs.catalyst.zoho.com/en/cloud-scale/help/search/search-indexing/)
- [Search Operations](https://docs.catalyst.zoho.com/en/cloud-scale/help/search/search-operations/)
- [Search SDK Reference](https://docs.catalyst.zoho.com/en/sdk/server-side-sdks/node-js-sdk/search/)
- [SDK Documentation](https://docs.catalyst.zoho.com/en/sdk/)

## Contributing

Contributions to this library are always welcome and highly encouraged.

See [CONTRIBUTING](../../CONTRIBUTING.md) for more information on how to get started.

## License

This SDK is distributed under the Apache License 2.0. See [LICENSE](../../LICENCE) file for more information.
