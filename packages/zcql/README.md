# @zcatalyst/zcql

JavaScript SDK for Catalyst ZCQL - SQL-like Query Language

## Overview

The `@zcatalyst/zcql` package provides JavaScript/TypeScript methods to execute [ZCQL](https://docs.catalyst.zoho.com/en/cloud-scale/help/zcql/introduction/) (Zoho Catalyst Query Language), Catalyst's proprietary SQL-like query language for data manipulation in [Data Store](https://docs.catalyst.zoho.com/en/cloud-scale/help/data-store/introduction/).

**ZCQL** is similar to MySQL/PostgreSQL and enables developers to work with data using familiar SQL syntax while handling complex queries with high efficiency and scalability.

### Key Features

- **SQL-like Syntax**: Familiar query language similar to MySQL
- **Full CRUD Operations**: SELECT, INSERT, UPDATE, DELETE support
- **JOIN Support**: Complex joins across multiple tables
- **Aggregations**: GROUP BY, ORDER BY, HAVING clauses
- **Built-in Functions**: Arithmetic and numeric operations
- **High Performance**: Efficient query execution at scale
- **WHERE Clauses**: Advanced filtering with multiple conditions
- **LIMIT Support**: Pagination and result set control
- **ZCQL Console**: Test queries before implementation

### Supported Operations

- **Data Retrieval**: SELECT queries with filters, joins, and sorting
- **Data Insertion**: INSERT new records into tables
- **Data Updates**: UPDATE existing records based on conditions
- **Data Deletion**: DELETE records matching criteria
- **Aggregations**: COUNT, SUM, AVG, MIN, MAX functions
- **Complex Joins**: INNER JOIN, LEFT JOIN, RIGHT JOIN

### ZCQL V2

> **Note**: From December 2024, all new projects use ZCQL V2 Parser. See [ZCQL V2](https://docs.catalyst.zoho.com/en/cloud-scale/help/zcql/syntax-exceptions/) for syntax details and improvements.

### Prerequisites

- A [Catalyst project](https://docs.catalyst.zoho.com/en/getting-started/catalyst-projects) set up
- Tables created in [Data Store](https://docs.catalyst.zoho.com/en/cloud-scale/help/data-store/introduction/)
- Understanding of SQL query syntax
- Test queries in [ZCQL Console](https://docs.catalyst.zoho.com/en/cloud-scale/help/zcql/zcql-console/) before implementation

## Installation

To install this package, simply type add or install @zcatalyst/zcql
using your favorite package manager:

- `npm install @zcatalyst/zcql`
- `yarn add @zcatalyst/zcql`
- `pnpm add @zcatalyst/zcql`

## Getting Started

### Import

The Catalyst SDK is modularized by Components.
To send a request, you only need to import the `ZCQL`:

```js
// ES5 example
const { ZCQL } = require("@zcatalyst/zcql");
```

```ts
// ES6+ example
import { ZCQL } from "@zcatalyst/zcql";
```

### Usage

To send a request, you:

- Create a ZCQL Instance.
- Call the ZCQL operation with input parameters.

```js
const zcqlInstance = new ZCQL();

const data = await zcqlInstance.executeZCQLQuery("select * from sample");
```

### Async/await

We recommend using [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
operator to wait for the promise returned by send operation as follows:

```js
// async/await.
try {
  const data = await zcqlInstance.executeZCQLQuery("select * from sample");
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
  const data = await zcql.executeZCQLQuery("select * from sample");
  // process data.
} catch (error) {
  const message = error.message;
  const status = error.statusCode;
  console.log({ message, status });
}
```

## Resources

- [ZCQL Documentation](https://docs.catalyst.zoho.com/en/cloud-scale/help/zcql/introduction/)
- [ZCQL Syntax](https://docs.catalyst.zoho.com/en/cloud-scale/help/zcql/syntax/)
- [ZCQL V2 Parser](https://docs.catalyst.zoho.com/en/cloud-scale/help/zcql/syntax-exceptions/)
- [ZCQL Console](https://docs.catalyst.zoho.com/en/cloud-scale/help/zcql/zcql-console/)
- [ZCQL Functions](https://docs.catalyst.zoho.com/en/cloud-scale/help/zcql/zcql-functions/)
- [SDK Documentation](https://docs.catalyst.zoho.com/en/sdk/)

## Contributing

Contributions to this library are always welcome and highly encouraged.

See [CONTRIBUTING](../../CONTRIBUTING.md) for more information on how to get started.

## License

This SDK is distributed under the Apache License 2.0. See [LICENSE](../../LICENCE) file for more information.
