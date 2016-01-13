# The code-studio package

This package contains static assets used by our "Code Studio" rails app (also known as "dashboard").

## Dev dependencies
You should have the following tools installed globally.

  * [GNU coreutils](http://www.gnu.org/software/coreutils/coreutils.html)
  * [rsync](https://rsync.samba.org/)

## Building code-studio static assets

1. Navigate to the `code-studio` directory (the location of this README).
2. Run `npm install` which does the following:
  * Downloads and installs all package dependencies, dev utilities, etc into the `node_modules` directory.
  * Creates a symlink from `node_modules/vendor` to the `vendor` directory in the package root, for easily including vendor code from our source files.
3. Run `npm run build` which does the following:
  * Copies various package assets to ./build/assets
  * Uses [browserify](http://browserify.org/) to build our JavaScript assets at ./build/js
  * Uses [node-sass](https://github.com/sass/node-sass) to build our CSS assets at ./build/css

## Resources:

Places we looked while getting this build system working:

* http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/
* https://medium.com/@brianhan/watch-compile-your-sass-with-npm-9ba2b878415b#.3i41ff5ih