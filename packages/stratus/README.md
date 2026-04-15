# @zcatalyst/stratus

JavaScript SDK for Catalyst Stratus - S3-Compatible Object Storage

## Overview

The `@zcatalyst/stratus` package provides JavaScript/TypeScript methods to interact with [Catalyst Stratus](https://docs.catalyst.zoho.com/en/cloud-scale/help/stratus/introduction/), a highly durable and scalable S3-compatible object storage service. Stratus is the next-generation upgrade to File Store.

**Catalyst Stratus** offers unlimited storage with industry-standard S3 API compatibility, making it ideal for large-scale data storage, backups, and static asset hosting.

### Key Features

- **Unlimited Storage**: No storage limits in production
- **S3 Compatible**: Works with S3-compatible tools and libraries
- **Bucket Management**: Organize objects into buckets
- **High Performance**: Optimized for large file operations
- **Scalable**: Handle any volume of data
- **Transfer Manager**: Multipart uploads for large files
- **Durability**: Multi-region redundancy
- **Fine-Grained Control**: Lifecycle management and versioning

> **Note**: Stratus is currently in Early Access. Contact [support@zohocatalyst.com](mailto:support@zohocatalyst.com) to enable it for your project.

### Use Cases

- Store large media files (videos, images, audio)
- Backup and archival storage
- Data lake and analytics storage
- Static website hosting
- Log file storage
- Machine learning dataset storage
- Distribution of large files
- CDN content storage

### Prerequisites

- A [Catalyst project](https://docs.catalyst.zoho.com/en/getting-started/catalyst-projects) set up
- Stratus enabled (contact support for Early Access)
- Buckets created in [Stratus Console](https://docs.catalyst.zoho.com/en/cloud-scale/help/stratus/bucket-management/)
- Understanding of [object storage concepts](https://docs.catalyst.zoho.com/en/cloud-scale/help/stratus/architecture/)

## Installation

To install this package, simply type add or install @zcatalyst/stratus
using your favorite package manager:

- `npm install @zcatalyst/stratus`
- `yarn add @zcatalyst/stratus`
- `pnpm add @zcatalyst/stratus`

## Getting Started

### Import

The Catalyst SDK is modularized by Components.
To handle object storage, you only need to import the `Stratus`:

```js
// ES5 example
const { Stratus, TransferManager } = require("@zcatalyst/stratus");
```

```ts
// ES6+ example
import { Stratus, TransferManager } from "@zcatalyst/stratus";
```

### Usage

#### Node.js Environment

For server-side object storage operations:

```js
const stratus = new Stratus(app);

// List all buckets
const buckets = await stratus.listBuckets();
console.log('Available buckets:', buckets);

// Check if bucket exists
const exists = await stratus.headBucket('my-bucket');

// Get bucket instance
const bucket = stratus.bucket('my-bucket');

// Upload file to bucket
const uploadResult = await bucket.uploadFile('./local-file.txt', 'remote-file.txt');

// Download file from bucket
const downloadResult = await bucket.downloadFile('remote-file.txt', './downloaded-file.txt');

// List files in bucket
const files = await bucket.listFiles();
```

#### Browser Environment

For client-side object storage operations:

```js
const stratus = new Stratus();

// Get bucket instance
const bucket = stratus.bucket('my-bucket');

// Upload file from browser input
const fileInput = document.getElementById('file-input');
const file = fileInput.files[0];
await bucket.uploadFile(file, 'uploaded-file.txt');

// Download file to browser
const downloadResult = await bucket.downloadFile('remote-file.txt');
const blob = new Blob([downloadResult.data]);
const url = URL.createObjectURL(blob);

// Create download link
const link = document.createElement('a');
link.href = url;
link.download = 'downloaded-file.txt';
link.click();
```

### Async/await

We recommend using [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
operator to wait for the promise returned by storage operations:

```js
// async/await.
try {
  const result = await bucket.uploadFile(file, 'destination.txt');
  // process result.
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
  const result = await bucket.uploadFile(file, 'destination.txt');
  // process result.
} catch (error) {
  const message = error.message;
  const status = error.statusCode;
  console.log({ message, status });
}
```

## API Reference

### Bucket Management

<details>
<summary>
List All Buckets
</summary>

```js
const buckets = await stratus.listBuckets();

buckets.forEach(bucket => {
  console.log('Bucket name:', bucket.name);
  console.log('Created at:', bucket.createdAt);
  console.log('Size:', bucket.size);
});
```

</details>

<details>
<summary>
Check Bucket Exists
</summary>

```js
// Check without throwing error
const exists = await stratus.headBucket('my-bucket');

// Check with error throwing
try {
  const exists = await stratus.headBucket('my-bucket', true);
  console.log('Bucket exists:', exists);
} catch (error) {
  console.log('Bucket check failed:', error.message);
}
```

</details>

<details>
<summary>
Get Bucket Instance
</summary>

```js
const bucket = stratus.bucket('my-bucket');

// Now you can perform file operations on this bucket
await bucket.uploadFile('./file.txt', 'remote-file.txt');
```

</details>

### File Operations

<details>
<summary>
Upload File (Node.js)
</summary>

```js
const bucket = stratus.bucket('my-bucket');

// Upload from file path
const result = await bucket.uploadFile('./local-file.txt', 'remote-file.txt');

console.log('Upload successful:', result.fileId);
console.log('File URL:', result.url);
```

</details>

<details>
<summary>
Upload File (Browser)
</summary>

```js
const bucket = stratus.bucket('my-bucket');

// Upload from file input
const fileInput = document.getElementById('file-input');
const file = fileInput.files[0];

const result = await bucket.uploadFile(file, 'uploaded-file.txt', {
  metadata: {
    originalName: file.name,
    uploadedBy: 'user123'
  }
});
```

</details>

<details>
<summary>
Download File (Node.js)
</summary>

```js
const bucket = stratus.bucket('my-bucket');

// Download to file path
await bucket.downloadFile('remote-file.txt', './downloaded-file.txt');

// Download to buffer
const buffer = await bucket.downloadFile('remote-file.txt');
console.log('File data:', buffer.toString());
```

</details>

<details>
<summary>
Download File (Browser)
</summary>

```js
const bucket = stratus.bucket('my-bucket');

// Download as blob
const result = await bucket.downloadFile('remote-file.txt');
const blob = new Blob([result.data]);

// Create download link
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'downloaded-file.txt';
link.click();
```

</details>

<details>
<summary>
Delete File
</summary>

```js
const bucket = stratus.bucket('my-bucket');
await bucket.deleteFile('remote-file.txt');
```

</details>

<details>
<summary>
List Files in Bucket
</summary>

```js
const bucket = stratus.bucket('my-bucket');

// List all files
const files = await bucket.listFiles();

// List with prefix
const files = await bucket.listFiles({
  prefix: 'images/',
  delimiter: '/'
});

files.forEach(file => {
  console.log('File name:', file.name);
  console.log('Size:', file.size);
  console.log('Last modified:', file.lastModified);
});
```

</details>

### Transfer Manager

<details>
<summary>
Create Transfer Manager
</summary>

```js
import { TransferManager } from '@zcatalyst/stratus';

const bucket = stratus.bucket('my-bucket');
const transferManager = new TransferManager(bucket);
```

</details>

<details>
<summary>
Upload with Progress Tracking
</summary>

```js
const uploadTask = transferManager.uploadFile(file, 'destination.txt');

uploadTask.on('progress', (progress) => {
  console.log(`Upload progress: ${progress.percentage}%`);
  console.log(`Bytes uploaded: ${progress.bytesUploaded}`);
  console.log(`Total bytes: ${progress.totalBytes}`);
});

uploadTask.on('complete', (result) => {
  console.log('Upload complete:', result.fileId);
});

uploadTask.on('error', (error) => {
  console.error('Upload error:', error);
});

// Start the upload
await uploadTask.start();
```

</details>

<details>
<summary>
Download with Progress Tracking
</summary>

```js
const downloadTask = transferManager.downloadFile('source.txt', 'destination.txt');

downloadTask.on('progress', (progress) => {
  console.log(`Download progress: ${progress.percentage}%`);
});

downloadTask.on('complete', (result) => {
  console.log('Download complete');
});

downloadTask.on('error', (error) => {
  console.error('Download error:', error);
});

// Start the download
await downloadTask.start();
```

</details>

### File Metadata

```js
// Upload with metadata
await bucket.uploadFile(file, 'destination.txt', {
  metadata: {
    originalName: 'original.txt',
    uploadedBy: 'user123',
    category: 'documents',
    tags: ['important', 'backup']
  },
  contentType: 'text/plain'
});
```

### File URLs

```js
const result = await bucket.uploadFile(file, 'destination.txt');

// Get public URL
const publicUrl = result.url;

// Get temporary URL (expires in 1 hour)
const tempUrl = bucket.getTemporaryUrl('destination.txt', {
  expiresIn: 3600
});
```

### Supported File Types

- **Documents**: PDF, DOC, DOCX, TXT, etc.
- **Images**: JPG, PNG, GIF, BMP, SVG, etc.
- **Videos**: MP4, AVI, MOV, etc.
- **Archives**: ZIP, RAR, TAR, etc.
- **Binary**: Any file type up to size limits

### Environment Support

This package automatically detects the environment and uses appropriate file handling:

- **Node.js**: Uses file system streams and buffers for efficient file operations
- **Browser**: Uses File API and Blob objects for browser-compatible operations

## Resources

- [Catalyst Stratus Documentation](https://docs.catalyst.zoho.com/en/cloud-scale/help/stratus/introduction/)
- [Stratus Architecture](https://docs.catalyst.zoho.com/en/cloud-scale/help/stratus/architecture/)
- [Bucket Management](https://docs.catalyst.zoho.com/en/cloud-scale/help/stratus/bucket-management/)
- [Object Operations](https://docs.catalyst.zoho.com/en/cloud-scale/help/stratus/object-operations/)
- [SDK Documentation](https://docs.catalyst.zoho.com/en/sdk/)

## Contributing

Contributions to this library are always welcome and highly encouraged.

See [CONTRIBUTING](../../CONTRIBUTING.md) for more information on how to get started.

## License

This SDK is distributed under the Apache License 2.0. See [LICENSE](../../LICENCE) file for more information.
