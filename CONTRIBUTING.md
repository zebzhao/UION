# Contributing

**Important:** these GitHub issues are for *bug reports and feature requests only*.

If you’re looking for ways to contribute, please [peruse open issues](https://github.com/zebzhao/uion/issues?milestone=&page=1&state=open).

Before submitting a pull request, consider implementing a live example first, say using [bl.ocks.org](http://bl.ocks.org). Real-world use cases go a long way to demonstrating the usefulness of a proposed feature. The more complex a feature’s implementation, the more usefulness it should provide.

## How to Submit a Pull Request

1. Click the “Fork” button to create your personal fork of the PyScript repository.

2. After cloning your fork of the PyScript repository in the terminal, run `npm install` to install dependencies.

3. Create a new branch for your new feature. For example: `git checkout -b my-awesome-feature`. A dedicated branch for your pull request means you can develop multiple features at the same time, and ensures that your pull request is stable even if you later decide to develop an unrelated feature.

4. The `uion.min.js` files are built from `uion.js`. Edit `uion.js` then run gulp to build the minified files.

5. Use `npm test` to run tests and verify your changes. If you are adding a new feature, you should add new tests! If you are changing existing functionality, make sure the existing tests run, or update them as appropriate.

6. Submit your pull request, and good luck!
