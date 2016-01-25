# The code-studio package

This package contains static assets consumed by our "Code Studio" rails app (also known as "dashboard").  Dashboard consumes a transpiled, concatenated, factored, compressed, mangled distribution version of this package (which it unpacks to `dashboard/public/code-studio-package`).  What you're looking at is the original source for that package, and the tools to build the distribution.

## Dev setup
You should have the following tools installed globally.

* [rsync](https://rsync.samba.org/)

Then, run `npm install` from the `code-studio` directory (the location of this README), which will do the following:

1. Downloads and installs all package dependencies, dev utilities, etc into the `node_modules` directory.
1. Creates a symlink from `node_modules/vendor` to the `vendor` directory in the package root, for easily including vendor code from our source files.

## Building the code-studio package
You have a few options.  In each case, the package will end up in `code-studio/build`.

Running **`npm run build:dist`** will create the whole distribution package from scratch - it runs linting and tests, wipes the build directory, and generates all the appropriate JS, CSS, and other assets, mangled and ready for production use.

Most of the time, though, you'll want a development build.  **`npm run build`** is faster and generates prettier output - and for JS and JSX files, it includes embedded sourcemaps for easy debugging.

We support auto-rebuilding too.  **`npm start`** beings a watch process that updates the build any time a JS or JSX file changes (Press <kbd>Ctrl</kbd>+<kbd>C</kbd> to stop).

There are other useful commands, like `npm run build-css` or `npm run copy-assets` - use `npm run` to list them all.

## Code style

Please follow our [style guide](../STYLEGUIDE.md).  We've set up linting to help:

* If you haven't already, run `rake install:hooks` to ensure our precommit linting is set up.
* Use **`npm run lint`** to lint the code-studio package.

## Resources:

Places we looked while getting this build system working:

* http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/
* https://medium.com/@brianhan/watch-compile-your-sass-with-npm-9ba2b878415b#.3i41ff5ih
