# TypeScript Absolute Paths Transformer

[![CircleCI](https://circleci.com/gh/kvendrik/ts-absolute-paths-transformer.svg?style=svg)](https://circleci.com/gh/kvendrik/ts-absolute-paths-transformer)
[![Coverage Status](https://coveralls.io/repos/github/kvendrik/ts-absolute-paths-transformer/badge.svg?branch=master)](https://coveralls.io/github/kvendrik/ts-absolute-paths-transformer?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A small utility that converts absolute paths in TypeScript files to relative ones.

## Installation

```
yarn add ts-absolute-paths-transformer
```

## Setup

```ts
const srcPath = resolve(__dirname, 'src');
const transformer = new TsAbsolutePathsTransformer({
  src: srcPath,
  isAbsoluteModule(path: string) {
    return path.startsWith('utilities');
  },
  resolveAbsoluteModule(path: string) {
    return resolve(srcPath, path);
  },
});

await transformer.transformAndSave();
```

## Why do we need this?

TypeScript supports handy options like [`baseUrl` and `paths`](https://www.typescriptlang.org/docs/handbook/compiler-options.html) which allow you to absolutely import files. Unfortunately however Microsoft currently (intentionally) [doesn't convert those absolute paths to relative ones at compile time](https://github.com/Microsoft/TypeScript/issues/15479#issuecomment-300240856) which when compiling your files using `tsc` leaves you with esnext code that won't work when imported into a different project because the absolute paths will break.

Hence this small utility which gives you an easy way to convert those absolute paths to relative ones yourself before you throw your code into `tsc`.

## Drag & drop example

Check out the example in the [example](example/) folder. It shows how to build a project that relies on being able to absolutely import modules using a `baseUrl`.
