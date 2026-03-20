# @zcatalyst/job-scheduling

JavaScript SDK for Catalyst Cron - Scheduled Job Execution

## Overview

The `@zcatalyst/job-scheduling` package provides JavaScript/TypeScript methods to manage [Catalyst Cron](https://docs.catalyst.zoho.com/en/serverless/help/cron/introduction/) jobs, which allow you to schedule and automate function executions at specific times or intervals.

**Catalyst Cron** (formerly Job Scheduling) enables time-based automation by executing Catalyst functions on a recurring schedule using cron expressions.

### Key Features

- **Scheduled Execution**: Run functions at specific times/intervals
- **Recurring Jobs**: Support for repeated task execution
- **Cron Expressions**: Standard cron syntax for scheduling
- **Function Integration**: Execute any Catalyst function
- **Job Management**: Create, update, delete, and monitor jobs
- **Reliable Execution**: Guaranteed job execution
- **Error Handling**: Track failures and retries
- **Time Zones**: Schedule across different time zones

### Use Cases

- Automated data backups
- Scheduled report generation
- Periodic data synchronization
- Database cleanup and maintenance
- Send scheduled emails/notifications
- Trigger batch processing
- Monitor and alert systems
- Generate analytics at intervals

### Prerequisites

- A [Catalyst project](https://docs.catalyst.zoho.com/en/getting-started/catalyst-projects) set up
- Functions created for scheduled execution
- Understanding of [cron expressions](https://docs.catalyst.zoho.com/en/serverless/help/cron/cron-scheduler/)

## Installation

To install this package, simply type add or install @zcatalyst/job-scheduling
using your favorite package manager:

- `npm install @zcatalyst/job-scheduling`
- `yarn add @zcatalyst/job-scheduling`
- `pnpm add @zcatalyst/job-scheduling`

## Getting Started

### Import

The Catalyst SDK is modularized by Components.
To send a request, you only need to import the `JobScheduling`:

```js
// ES5 example
const { JobScheduling } = require('@zcatalyst/job-scheduling');
```

```ts
// ES6+ example
import { JobScheduling } from '@zcatalyst/job-scheduling';
```

### Usage

To send a request, you:

- Create a JobScheduling Instance.
- Call the JobScheduling operation with input parameters.

```js
const jobScheduling = new JobScheduling();

const data = await jobScheduling.JOB.getJob('124567890');
```

### Async/await

We recommend using [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
operator to wait for the promise returned by send operation as follows:

```js
// async/await.
try {
	const data = await jobScheduling.JOB.getJob('124567890');
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
	const data = await jobScheduling.JOB.getJob('124567890');
	// process data.
} catch (error) {
	const message = error.message;
	const status = error.statusCode;
	console.log({ message, status });
}
```

## Resources

- [Catalyst Cron Documentation](https://docs.catalyst.zoho.com/en/serverless/help/cron/introduction/)
- [Cron Scheduler](https://docs.catalyst.zoho.com/en/serverless/help/cron/cron-scheduler/)
- [Cron Expressions](https://docs.catalyst.zoho.com/en/serverless/help/cron/cron-expressions/)
- [Cron SDK Reference](https://docs.catalyst.zoho.com/en/sdk/server-side-sdks/node-js-sdk/cron/)
- [SDK Documentation](https://docs.catalyst.zoho.com/en/sdk/)

## Contributing

Contributions to this library are always welcome and highly encouraged.

See [CONTRIBUTING](../../CONTRIBUTING.md) for more information on how to get started.

## License

This SDK is distributed under the Apache License 2.0. See [LICENSE](../../LICENCE) file for more information.
