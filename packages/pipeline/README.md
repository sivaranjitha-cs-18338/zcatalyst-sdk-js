# @zcatalyst/pipeline

JavaScript SDK for Catalyst Pipeline - Data Pipeline Orchestration

## Overview

The `@zcatalyst/pipeline` package provides JavaScript/TypeScript methods to interact with [Catalyst Pipeline](https://docs.catalyst.zoho.com/en/serverless/help/pipeline/introduction/), a service for orchestrating complex data workflows and ETL (Extract, Transform, Load) operations.

**Catalyst Pipeline** enables you to create, manage, and execute data pipelines that automate data processing workflows across multiple Catalyst components.

### Key Features

- **Workflow Orchestration**: Chain multiple operations in sequence
- **ETL Operations**: Extract, Transform, Load data workflows
- **Component Integration**: Connect Data Store, Functions, and more
- **Automated Execution**: Trigger pipelines automatically
- **Pipeline Management**: Create, update, monitor pipelines
- **Data Transformation**: Process and transform data between stages
- **Error Handling**: Built-in retry and error management
- **Execution History**: Track pipeline runs and status

### Use Cases

- Automate data migration between tables
- Build ETL workflows for analytics
- Process and transform incoming data
- Synchronize data across systems
- Implement data quality checks
- Aggregate and consolidate data
- Schedule batch data processing

### Prerequisites

- A [Catalyst project](https://docs.catalyst.zoho.com/en/getting-started/catalyst-projects) set up
- Pipelines created in [Catalyst Console](https://docs.catalyst.zoho.com/en/serverless/help/pipeline/pipeline-creation/)
- Understanding of [pipeline components](https://docs.catalyst.zoho.com/en/serverless/help/pipeline/pipeline-components/)

## Installation

To install this package, simply type add or install @zcatalyst/pipelines
using your favorite package manager:

- `npm install @zcatalyst/pipelines`
- `yarn add @zcatalyst/pipelines`
- `pnpm add @zcatalyst/pipelines`

## Getting Started

### Import

The Catalyst SDK is modularized by Components.
To send a request, you only need to import the `Pipeline`:

```js
// ES5 example
const { Pipeline } = require('@zcatalyst/pipelines');
```

```ts
// ES6+ example
import { Pipeline } from '@zcatalyst/pipelines';
```

### Usage

To send a request, you:

- Create a Pipeline Instance.
- Call the Pipeline operation with input parameters.

```js
const pipeline = new Pipeline();

const data = await pipeline.getPipelineDetails("16965000000019146");
```

### Async/await

We recommend using [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
operator to wait for the promise returned by send operation as follows:

```js
try {
	const data = await pipeline.getPipelineDetails("16965000000019146");
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
	const data = await pipeline.getPipelineDetails("16965000000019146");
	// process data.
} catch (error) {
	const message = error.message;
	const status = error.statusCode;
	console.log({ message, status });
}
```

## Resources

- [Catalyst Pipeline Documentation](https://docs.catalyst.zoho.com/en/serverless/help/pipeline/introduction/)
- [Pipeline Components](https://docs.catalyst.zoho.com/en/serverless/help/pipeline/pipeline-components/)
- [Pipeline Creation](https://docs.catalyst.zoho.com/en/serverless/help/pipeline/pipeline-creation/)
- [Pipeline Execution](https://docs.catalyst.zoho.com/en/serverless/help/pipeline/pipeline-execution/)
- [SDK Documentation](https://docs.catalyst.zoho.com/en/sdk/)

## Contributing

Contributions to this library are always welcome and highly encouraged.

See [CONTRIBUTING](../../CONTRIBUTING.md) for more information on how to get started.

## License

This SDK is distributed under the Apache License 2.0. See [LICENSE](../../LICENCE) file for more information.
