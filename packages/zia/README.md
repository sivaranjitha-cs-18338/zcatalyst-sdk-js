# @zcatalyst/zia

JavaScript SDK for Catalyst Zia - AI and Machine Learning Services

## Overview

The `@zcatalyst/zia` package provides JavaScript/TypeScript methods to access [Catalyst Zia](https://docs.catalyst.zoho.com/en/ai-ml/help/zia-services/introduction/), Zoho's AI and ML engine offering pre-trained AI services. Zia provides ready-to-use AI capabilities without requiring ML expertise.

**Catalyst Zia** includes services for OCR, barcode detection, image moderation, object detection, face analytics, and more - all accessible through simple SDK methods.

### Key Features

- **Pre-trained AI**: Ready-to-use AI models without training
- **OCR**: Extract text from images with high accuracy
- **Barcode Detection**: Scan and read barcodes/QR codes
- **Image Moderation**: Detect inappropriate content
- **Face Analytics**: Identify faces and analyze attributes
- **Object Detection**: Recognize objects in images
- **Keyword Extraction**: Extract key terms from text
- **MICR Code Detection**: Read bank cheque MICR codes
- **Quick Integration**: Simple API with fast response times

### Use Cases

- Document digitization with OCR
- Inventory management with barcode scanning
- Content moderation for user uploads
- Face recognition for security
- Automated image tagging
- Receipt and invoice processing
- ID card and passport scanning
- Sentiment analysis

### Prerequisites

- A [Catalyst project](https://docs.catalyst.zoho.com/en/getting-started/catalyst-projects) set up
- Understanding of [Zia services](https://docs.catalyst.zoho.com/en/ai-ml/help/zia-services/introduction/)
- Image files for processing (for OCR, barcode, etc.)

## Installation

To install this package, simply type add or install @zcatalyst/zia
using your favorite package manager:

- `npm install @zcatalyst/zia`
- `yarn add @zcatalyst/zia`
- `pnpm add @zcatalyst/zia`

## Getting Started

### Import

The Catalyst SDK is modularized by Components.
To send a request, you only need to import the `Zia`:

```js
// ES5 example
const { Zia } = require("@zcatalyst/zia");
```

```ts
// ES6+ example
import { Zia } from "@zcatalyst/zia";
```

### Usage

To send a request, you:

- Create a Zia Instance.
- Call the Zia operation with input parameters.

```js
const zia = new Zia();

// Example: Scan barcode from image
const result = await zia.scanBarcode(fs.createReadStream('path/to/barcode.png'));
```

### Async/await

We recommend using [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
operator to wait for the promise returned by send operation as follows:

```js
// async/await.
try {
  const data = await zia.scanBarcode(fs.createReadStream('sam/barcode.png'));
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
  const data = await zia.scanBarcode(fs.createReadStream('sam/barcode.png'));
  // process data.
} catch (error) {
  const message = error.message;
  const status = error.statusCode;
  console.log({ message, status });
}
```

## Resources

- [Catalyst Zia Documentation](https://docs.catalyst.zoho.com/en/ai-ml/help/zia-services/introduction/)
- [OCR](https://docs.catalyst.zoho.com/en/ai-ml/help/zia-services/ocr/)
- [Barcode Detection](https://docs.catalyst.zoho.com/en/ai-ml/help/zia-services/barcode-detection/)
- [Image Moderation](https://docs.catalyst.zoho.com/en/ai-ml/help/zia-services/image-moderation/)
- [Face Analytics](https://docs.catalyst.zoho.com/en/ai-ml/help/zia-services/face-analytics/)
- [SDK Documentation](https://docs.catalyst.zoho.com/en/sdk/)

## Contributing

Contributions to this library are always welcome and highly encouraged.

See [CONTRIBUTING](../../CONTRIBUTING.md) for more information on how to get started.

## License

This SDK is distributed under the Apache License 2.0. See [LICENSE](../../LICENCE) file for more information.
