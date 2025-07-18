# Contributing to CATALYST JS SDK

Thank you for your interest in contributing to the Catalyst JS SDK! Catalyst is a serverless platform by Zoho that enables developers to build scalable full-stack applications without managing infrastructure.The Catalyst JS SDK provides a modular and developer-friendly interface to interact with Catalyst services. This SDK is designed for use in both Node.js and browser environments and is fully open source to encourage community collaboration.

## Filing Bug Reports

You can file bug reports against the SDK on the [GitHub issues][issues] page.

If you are filing a report for a bug or regression in the SDK, it's extremely
helpful to provide as much information as possible when opening the original
issue. This helps us reproduce and investigate the possible bug without having
to wait for this extra information to be provided. Please read the following
guidelines prior to filing a bug report.

1. Search through existing [issues][] to ensure that your specific issue has
   not yet been reported. If it is a common issue, it is likely there is
   already a bug report for your problem.

2. Ensure that you have tested the latest version of the SDK. Although you
   may have an issue against an older version of the SDK, we cannot provide
   bug fixes for old versions. It's also possible that the bug may have been
   fixed in the latest release.

3. Provide as much information about your environment, SDK version, and
   relevant dependencies as possible. For example, let us know what version
   of Node.js you are using, or if it's a browser issue, which browser you
   are using. If the issue only occurs with a specific dependency loaded,
   please provide that dependency name and version.

4. Provide a minimal test case that reproduces your issue or any error
   information you related to your problem. We can provide feedback much
   more quickly if we know what operations you are calling in the SDK. If
   you cannot provide a full test case, provide as much code as you can
   to help us diagnose the problem. Any relevant information should be provided
   as well, like whether this is a persistent issue, or if it only occurs
   some of the time.

## Submitting Pull Requests

We are always happy to receive code and documentation contributions to the SDK.
Please be aware of the following notes prior to opening a pull request:

1. The SDK is released under the [Apache license 2.0](./LICENCE).
   Any code you contribute will also be released under this license.
   For significant contributions, we may ask you to sign a Contributor License Agreement (CLA).
   Please send the signed CLA to support@zohocatalyst.com.

2. If you would like to implement support for a significant feature that is not
   yet available in the SDK, please talk to us beforehand to avoid any
   duplication of effort.

3. Wherever possible, pull requests should contain tests as appropriate.
   Bugfixes should contain tests that exercise the corrected behavior (i.e., the
   test should fail without the bugfix and pass with it), and new features
   should be accompanied by tests exercising the feature. Pull requests that
   contain failing tests will not be merged until the test failures are addressed.
   Pull requests that cause a significant drop in the SDK's test coverage
   percentage are unlikely to be merged until tests have been added.

4. Commit tile and message and pull request title and description must adhere to
   [conventional commits][conventional commits]. Title must begin with `feat(package_name): title`,
   `fix(package_name): title`, `docs(package_name): title`, `test(package_name): title`, `chore(package_name): title`.
   Title should be lowercase and not period at the end of it. If the commit includes
   a breaking change, the commit message must end with a single paragraph: `BREAKING CHANGE: a description of what broke`


### Setup and Testing

This project uses a monorepo to manage all of the packages.
This allows us to easily test the effects of changes in one package to others.

Make sure you have [`pnpm`](https://pnpm.io/) installed by:

```
pnpm --version
```

If not, please refer to [pnpm installation](https://pnpm.io/installation) to install `pnpm`.

To install the dependencies and link the library, run the following command under project root:

```
pnpm
```

To run all of the tests in the repository, still from the root package, run the following command
under project root:

```
pnpm run test
```

The above command will use turbo to run the `test` script in every package of the monorepo.

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing to Catalyst! 🎉

[issues]: https://github.com/catalystbyzoho/zcatalyst-sdk-js/issues
[conventional commits]: https://www.conventionalcommits.org/
[pr]: https://github.com/catalystbyzoho/zcatalyst-sdk-js-v3/pulls
