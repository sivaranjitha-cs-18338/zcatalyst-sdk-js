# @zcatalyst/smartbrowz

JavaScript SDK for Catalyst SmartBrowz - Web Scraping and Document Conversion

## Overview

The `@zcatalyst/smartbrowz` package provides JavaScript/TypeScript methods to access [Catalyst SmartBrowz](https://docs.catalyst.zoho.com/en/ai-ml/help/smartbrowz/introduction/), a headless browser service for web scraping, screenshot capture, and HTML-to-PDF conversion.

**Catalyst SmartBrowz** enables you to automate browser tasks, extract web content, capture screenshots, and convert web pages to PDF format without managing browser infrastructure.

### Key Features

- **Web Scraping**: Extract content from websites
- **PDF Conversion**: Convert HTML/URLs to PDF documents
- **Screenshot Capture**: Capture webpage screenshots
- **Headless Browser**: Automated browser operations
- **Customizable**: Configure page size, format, and options
- **Dynamic Content**: Handle JavaScript-rendered pages
- **Batch Processing**: Process multiple pages efficiently
- **Serverless**: No browser infrastructure management

### Use Cases

- Generate PDF reports from web pages
- Capture website screenshots
- Scrape product information
- Archive web content
- Generate invoices and receipts
- Create printable documents from HTML
- Monitor website changes
- Extract structured data from websites

### Prerequisites

- A [Catalyst project](https://docs.catalyst.zoho.com/en/getting-started/catalyst-projects) set up
- Understanding of [SmartBrowz operations](https://docs.catalyst.zoho.com/en/ai-ml/help/smartbrowz/smartbrowz-operations/)
- Valid URLs or HTML content for processing

## Installation

To install this package, simply type add or install @zcatalyst/smartbrowz
using your favorite package manager:

- `npm install @zcatalyst/smartbrowz`
- `yarn add @zcatalyst/smartbrowz`
- `pnpm add @zcatalyst/smartbrowz`

## Getting Started

### Import

The Catalyst SDK is modularized by Components.
To send a request, you only need to import the `Smartbrowz`:

```js
// ES5 example
const { Smartbrowz } = require("@zcatalyst/smartbrowz");
```

```ts
// ES6+ example
import { Smartbrowz } from "@zcatalyst/smartbrowz";
```

### Usage

To send a request, you:

- Create a Smartbrowz Instance.
- Call the Smartbrowz operation with input parameters.

```js
const smartbrowz = new Smartbrowz();

const data = await smartbrowz.convertToPdf("Hey, please convert this to a PDF.");
```

### Async/await

We recommend using [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
operator to wait for the promise returned by send operation as follows:

```js
// async/await.
try {
  const smartbrowz = new Smartbrowz();
  const data = await smartbrowz.convertToPdf("Hey, please convert this to a PDF.");
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
  const data = await smartbrowz.convertToPdf("Hey, please convert this to a PDF.");
  // process data.
} catch (error) {
  const message = error.message;
  const status = error.statusCode;
  console.log({ message, status });
}
```

## Resources

- [Catalyst SmartBrowz Documentation](https://docs.catalyst.zoho.com/en/ai-ml/help/smartbrowz/introduction/)
- [SmartBrowz Operations](https://docs.catalyst.zoho.com/en/ai-ml/help/smartbrowz/smartbrowz-operations/)
- [PDF Conversion](https://docs.catalyst.zoho.com/en/ai-ml/help/smartbrowz/pdf-conversion/)
- [SmartBrowz SDK Reference](https://docs.catalyst.zoho.com/en/sdk/server-side-sdks/node-js-sdk/smartbrowz/)
- [SDK Documentation](https://docs.catalyst.zoho.com/en/sdk/)

## Contributing

Contributions to this library are always welcome and highly encouraged.

See [CONTRIBUTING](../../CONTRIBUTING.md) for more information on how to get started.

## License

This SDK is distributed under the Apache License 2.0. See [LICENSE](../../LICENCE) file for more information.
