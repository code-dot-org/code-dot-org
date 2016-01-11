# The code-studio package

This package contains static assets used by our "Code Studio" rails app (also known as "dashboard").

## Dev dependencies
You should have the following tools installed globally.
  * [GNU coreutils](http://www.gnu.org/software/coreutils/coreutils.html)
  * [rsync](https://rsync.samba.org/)

## Building code-studio static assets

1. From the `code-studio` directory, run `npm install` which does the following:
  * Downloads and installs all package dependencies, dev utilities, etc into the `node_modules` directory.
  * Creates a symlink from `node_modules/vendor` to the `vendor` directory in the package root, for easily including vendor code from our source files.

## Resources:

Places we looked while getting this build system working:

* http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/
* https://medium.com/@brianhan/watch-compile-your-sass-with-npm-9ba2b878415b#.3i41ff5ih