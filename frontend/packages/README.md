# Frontend Application Packages

The Code.org platform is a modular TypeScript application comprised of many different
packages. They are all built together and can cross-reference one another as part of
the larger workspace via [Turborepo](https://turborepo.com/).

To build all of the packages at once (and all applications), just run the following
commands from this directory:

```shell
yarn
yarn build
```

To just build one of the packages, just specify it via a `--filter` option:

```shell
yarn build --filter @code-dot-org/lab-base
```

It is often good enough to build the offline application or the storybook to build
the entire set of packages:

```shell
yarn build --filter @code-dot-org/offline
```
