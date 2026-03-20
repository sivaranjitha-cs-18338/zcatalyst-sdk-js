# @zcatalyst/datastore

JavaScript SDK for Catalyst Data Store - Relational Database Management

## Overview

The `@zcatalyst/datastore` package provides JavaScript/TypeScript methods to interact with [Catalyst Data Store](https://docs.catalyst.zoho.com/en/cloud-scale/help/data-store/introduction/), a cloud-based relational database management system for storing your application's persistent data. Data Store is part of Catalyst Cloud Scale services and offers a fully-managed SQL database with built-in OLAP support.

**Catalyst Data Store** serves as a powerful relational database where you can create tables, define columns with specific data types, manage records, and execute complex queries using [ZCQL](https://docs.catalyst.zoho.com/en/cloud-scale/help/zcql/introduction/) (Catalyst's SQL-like query language).

### Key Features

- **Relational Database**: Structured data storage with tables, rows, and columns
- **ZCQL Support**: Execute MySQL-like queries for data manipulation
- **OLAP Database**: Built-in analytical query processing for large datasets
- **Scopes & Permissions**: Role-based access control for tables
- **Bulk Operations**: Efficient batch insert, update, and delete operations
- **Advanced Search**: Integration with [Catalyst Search](https://docs.catalyst.zoho.com/en/cloud-scale/help/search-integration/introduction/) for indexed columns
- **High Performance**: Cloud storage with scalability and universal access
- **Real-time Sync**: Automatic data synchronization across collaborators

### Use Cases

Choose Data Store if:
- Your data is **well-structured** and organized in rows and columns
- You need **relational architecture** with data point relationships
- Your schema is **uniform and known in advance**
- You require **SQL queries** for data operations
- **ACID compliance** (Atomicity, Consistency, Isolation, Durability) is priority
- You have a **read-heavy** database requiring fast, efficient querying

> **Alternative**: For unstructured/semi-structured data, use [@zcatalyst/nosql](https://www.npmjs.com/package/@zcatalyst/nosql) instead. See [comparison guide](https://docs.catalyst.zoho.com/en/cloud-scale/help/nosql/introduction/#catalyst-data-store-vs-nosql).

### Prerequisites

- A [Catalyst project](https://docs.catalyst.zoho.com/en/getting-started/catalyst-projects) set up
- Tables created in [Data Store](https://docs.catalyst.zoho.com/en/cloud-scale/help/data-store/tables/)
- [Scopes & Permissions](https://docs.catalyst.zoho.com/en/cloud-scale/help/data-store/scopes-and-permissions/) configured for your tables

## Installation

To install this package, simply type add or install @zcatalyst/datastore
using your favorite package manager:

- `npm install @zcatalyst/datastore`
- `yarn add @zcatalyst/datastore`
- `pnpm add @zcatalyst/datastore`

## Getting Started

### Import

The Catalyst SDK is modularized by components.
To handle data storage, you only need to import the `DataStore`:

```js
// ES5 example
const { DataStore } = require("@zcatalyst/datastore");
```

```ts
// ES6+ example
import { DataStore } from "@zcatalyst/datastore";
```

### Usage

#### Create DataStore Instance

Initialize the DataStore component to interact with your tables:

```js
import { DataStore } from "@zcatalyst/datastore";

// Initialize with Catalyst app instance
const dataStore = new DataStore(app);
```

#### Basic CRUD Operations

**Insert Records:**
```js
// Insert a single record into a table
const result = await dataStore.table('users').insert({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  status: 'active'
});

console.log(result.ROWID); // Auto-generated row ID
```

**Query Records:**
```js
// Select specific columns with filtering
const users = await dataStore.table('users')
  .select(['ROWID', 'name', 'email', 'age'])
  .where('age', '>', 18)
  .orderBy('name', 'asc')
  .limit(10)
  .get();

// Get all records
const allUsers = await dataStore.table('users')
  .select(['*'])
  .get();
```

**Update Records:**
```js
// Update records matching condition
await dataStore.table('users')
  .where('email', 'john@example.com')
  .update({
    status: 'inactive',
    last_active: new Date()
  });
```

**Delete Records:**
```js
// Delete records matching condition
await dataStore.table('users')
  .where('status', 'inactive')
  .delete();
```

#### Advanced Querying

**Complex Filters:**
```js
// Multiple conditions with AND/OR
const activeAdults = await dataStore.table('users')
  .select(['name', 'email'])
  .where('age', '>=', 18)
  .where('status', '=', 'active')
  .get();
```

**Sorting and Pagination:**
```js
// Order by multiple columns with pagination
const users = await dataStore.table('users')
  .select(['*'])
  .orderBy('created_time', 'desc')
  .orderBy('name', 'asc')
  .limit(20)
  .offset(40) // Page 3 (20 records per page)
  .get();
```

#### Bulk Operations

For efficient batch processing:

```js
// Bulk insert
const records = [
  { name: 'User 1', email: 'user1@example.com' },
  { name: 'User 2', email: 'user2@example.com' },
  { name: 'User 3', email: 'user3@example.com' }
];

const bulkResult = await dataStore.table('users').bulkInsert(records);

// Bulk update
await dataStore.table('users').bulkUpdate(records);

// Bulk delete
await dataStore.table('users').bulkDelete([rowId1, rowId2, rowId3]);
```

> **Note**: Bulk operations are processed asynchronously using queues for better performance with large datasets. Learn more about [Bulk Operations](https://docs.catalyst.zoho.com/en/cloud-scale/help/data-store/bulk-operations/).

#### Table Metadata

Get table information:

```js
// Get table details
const tableInfo = await dataStore.table('users').getTableDetails();
console.log(tableInfo.table_name, tableInfo.columns);

// List all tables
const tables = await dataStore.getAllTableDetails();
```

#### Node.js Environment (Server-Side)

For server-side operations in Catalyst functions:

```js
const dataStore = new DataStore(app);

// Insert data
const result = await dataStore.table('users').insert({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});

// Query data
const users = await dataStore.table('users')
  .select(['name', 'email'])
  .where('age', '>', 18)
  .orderBy('name', 'asc')
  .limit(10)
  .get();
```

#### Browser Environment

For client-side data operations:

```js
const dataStore = new DataStore(app);

// Create data
const user = await dataStore.table('users').create({
  name: 'Jane Doe',
  email: 'jane@example.com'
});

// Read data
const users = await dataStore.table('users').find({
  where: { age: { $gt: 18 } },
  orderBy: { name: 'asc' },
  limit: 10
});
```

### Table Operations

The DataStore provides a fluent API for database operations:

```js
const table = dataStore.table('users');

// CRUD Operations
await table.insert(data);           // Create
await table.select(['*']).get();   // Read
await table.where('id', 1).update(data);  // Update
await table.where('id', 1).delete();      // Delete
```

### Environment Support

This package automatically detects the environment and uses appropriate database drivers:

- **Node.js**: Uses native database drivers
- **Browser**: Uses HTTP-based data access

## Async/await

We recommend using [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
operator to wait for the promise returned by data operations:

```js
// async/await.
try {
  const result = await dataStore.table('users').insert(data);
  // process result.
} catch (error) {
  // error handling.
} finally {
  // finally.
}
```

## Error Handling

When the service returns an exception, the error will include the exception information,
as well as response metadata (e.g. request id).

```js
try {
  const result = await dataStore.table('users').insert(data);
  // process result.
} catch (error) {
  const message = error.message;
  const status = error.statusCode;
  console.log({ message, status });
}
```

## API Reference

### Table Management

<details>
<summary>
Create Table
</summary>

```js
const table = await dataStore.createTable('users', {
  columns: [
    { name: 'id', type: 'integer', autoIncrement: true, primaryKey: true },
    { name: 'name', type: 'string', required: true },
    { name: 'email', type: 'string', unique: true },
    { name: 'age', type: 'integer' },
    { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' }
  ]
});
```

</details>

<details>
<summary>
Get Table
</summary>

```js
const table = dataStore.table('users');
// or
const table = await dataStore.getTable('users');
```

</details>

<details>
<summary>
List Tables
</summary>

```js
const tables = await dataStore.listTables();
```

</details>

<details>
<summary>
Delete Table
</summary>

```js
await dataStore.deleteTable('users');
```

</details>

### CRUD Operations

<details>
<summary>
Insert Data
</summary>

```js
// Single record
const result = await table.insert({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});

// Multiple records
const results = await table.insert([
  { name: 'Jane Doe', email: 'jane@example.com', age: 25 },
  { name: 'Bob Smith', email: 'bob@example.com', age: 35 }
]);
```

</details>

<details>
<summary>
Select Data
</summary>

```js
// Select all columns
const users = await table.select().get();

// Select specific columns
const users = await table.select(['name', 'email']).get();

// With conditions
const users = await table
  .select(['name', 'email'])
  .where('age', '>', 18)
  .where('status', '=', 'active')
  .get();

// With ordering
const users = await table
  .select()
  .orderBy('name', 'asc')
  .orderBy('age', 'desc')
  .get();

// With pagination
const users = await table
  .select()
  .limit(10)
  .offset(20)
  .get();
```

</details>

<details>
<summary>
Update Data
</summary>

```js
// Update specific record
const result = await table
  .where('id', 1)
  .update({
    name: 'Updated Name',
    age: 31
  });

// Update multiple records
const result = await table
  .where('status', '=', 'inactive')
  .update({ status: 'active' });
```

</details>

<details>
<summary>
Delete Data
</summary>

```js
// Delete specific record
const result = await table.where('id', 1).delete();

// Delete multiple records
const result = await table.where('status', '=', 'deleted').delete();
```

</details>

### Advanced Queries

<details>
<summary>
Complex Where Conditions
</summary>

```js
// AND conditions
const users = await table
  .where('age', '>', 18)
  .where('status', '=', 'active')
  .get();

// OR conditions
const users = await table
  .where('age', '<', 18)
  .orWhere('status', '=', 'vip')
  .get();

// Complex conditions
const users = await table
  .where('age', '>', 18)
  .andWhere(function(query) {
    query.where('status', '=', 'active')
          .orWhere('vip', '=', true);
  })
  .get();
```

</details>

<details>
<summary>
Like and Search
</summary>

```js
// Starts with
const users = await table
  .where('name', 'LIKE', 'John%')
  .get();

// Contains
const users = await table
  .where('email', 'LIKE', '%@example.com')
  .get();

// Case-insensitive search
const users = await table
  .where('name', 'ILIKE', '%john%')
  .get();
```

</details>

<details>
<summary>
In and Between
</summary>

```js
// IN clause
const users = await table
  .where('status', 'IN', ['active', 'pending'])
  .get();

// NOT IN clause
const users = await table
  .where('status', 'NOT IN', ['deleted', 'banned'])
  .get();

// BETWEEN clause
const users = await table
  .where('age', 'BETWEEN', [18, 65])
  .get();
```

</details>

<details>
<summary>
Aggregations
</summary>

```js
// Count
const count = await table.count();
const count = await table.where('age', '>', 18).count();

// Sum
const total = await table.sum('age');
const total = await table.where('status', '=', 'active').sum('age');

// Average
const average = await table.avg('age');

// Min/Max
const minAge = await table.min('age');
const maxAge = await table.max('age');
```

</details>

<details>
<summary>
Joins
</summary>

```js
// Inner join
const results = await table('users')
  .join('profiles', 'users.id', '=', 'profiles.user_id')
  .select(['users.name', 'profiles.bio'])
  .get();

// Left join
const results = await table('users')
  .leftJoin('orders', 'users.id', '=', 'orders.user_id')
  .select(['users.name', 'orders.total'])
  .get();
```

</details>

### Transactions

<details>
<summary>
Transaction Operations
</summary>

```js
// Start transaction
const transaction = await dataStore.beginTransaction();

try {
  // Perform operations
  await transaction.table('users').insert(userData);
  await transaction.table('profiles').insert(profileData);

  // Commit transaction
  await transaction.commit();
} catch (error) {
  // Rollback on error
  await transaction.rollback();
  throw error;
}
```

</details>

### Data Types

#### Supported Column Types

- `string` - Text data
- `integer` - Whole numbers
- `float` - Decimal numbers
- `boolean` - True/false values
- `datetime` - Date and time
- `date` - Date only
- `time` - Time only
- `json` - JSON data
- `blob` - Binary data
- `text` - Long text

#### Column Options

```js
{
  name: 'column_name',
  type: 'string',
  required: true,           // NOT NULL
  unique: true,             // UNIQUE constraint
  default: 'default_value', // DEFAULT value
  autoIncrement: true,      // AUTO_INCREMENT
  primaryKey: true,         // PRIMARY KEY
  length: 255,             // For string types
  precision: 10,           // For numeric types
  scale: 2                 // For decimal types
}
```

## Resources

- [Data Store Documentation](https://docs.catalyst.zoho.com/en/cloud-scale/help/data-store/introduction/)
- [Node.js SDK Reference](https://docs.catalyst.zoho.com/en/sdk/nodejs/v2/cloud-scale/data-store/get-component-instance/)
- [Web SDK Reference](https://docs.catalyst.zoho.com/en/sdk/web/v4/cloud-scale/data-store/get-component-instance/)
- [API Documentation](https://docs.catalyst.zoho.com/en/api/code-reference/cloud-scale/data-store/insert-new-row/)
- [ZCQL Documentation](https://docs.catalyst.zoho.com/en/cloud-scale/help/zcql/introduction/)
- [Catalyst Search](https://docs.catalyst.zoho.com/en/cloud-scale/help/search-integration/introduction/)
- [OLAP Database](https://docs.catalyst.zoho.com/en/cloud-scale/help/data-store/olap-database/introduction/)
- [Catalyst Console](https://console.catalyst.zoho.com/)
- [Community Forums](https://forums.catalyst.zoho.com/)

## Contributing

Contributions to this library are always welcome and highly encouraged.

See [CONTRIBUTING](../../CONTRIBUTING.md) for more information on how to get started.

## License

This SDK is distributed under the Apache License 2.0. See [LICENSE](../../LICENCE) file for more information.
