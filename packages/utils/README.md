# @zcatalyst/utils

Utility Functions for Catalyst SDK - Internal Helper Module

## Overview

The `@zcatalyst/utils` package provides common utility functions and helpers used internally across all Catalyst SDK packages. This includes validation, formatting, type checking, and shared constants.

**Catalyst Utils** is an infrastructure package containing shared code to reduce duplication across SDK components and ensure consistency.

### Key Features

- **Validation Helpers**: Input validation and sanitization
- **Type Checking**: Runtime type validation
- **Data Formatting**: Standard formatting functions
- **Shared Constants**: Common values and configurations
- **Performance Utils**: Optimization helpers
- **Error Utilities**: Error creation and handling

> **Note**: This is an internal infrastructure package used by other Catalyst SDK packages. Most developers won't need to use this directly - use the component-specific packages instead.

### Prerequisites

- Typically installed as a dependency of other Catalyst packages
- Not required to be installed separately unless building custom integrations

## Installation

To install this package, simply type add or install @zcatalyst/utils
using your favorite package manager:

- `npm install @zcatalyst/utils`
- `yarn add @zcatalyst/utils`
- `pnpm add @zcatalyst/utils`

## Getting Started

> **Note**: This package is primarily for internal SDK use. For application development, use the component-specific packages like `@zcatalyst/datastore`, `@zcatalyst/auth`, etc.

If you're building custom integrations or extensions to the Catalyst SDK, you may use utility functions as needed:

```js
const { validateInput, formatResponse } = require('@zcatalyst/utils');
```

## Resources

- [Catalyst Documentation](https://docs.catalyst.zoho.com/)
- [SDK Overview](https://docs.catalyst.zoho.com/en/sdk/)
- [GitHub Repository](https://github.com/catalystbyzoho/zcatalyst-sdk-js)

## Contributing

Contributions to this library are always welcome and highly encouraged.

See [CONTRIBUTING](../../CONTRIBUTING.md) for more information on how to get started.

## License

This SDK is distributed under the Apache License 2.0. See [LICENSE](../../LICENCE) file for more information.
