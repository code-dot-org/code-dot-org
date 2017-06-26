# Upgrading the JS Interpreter

## Component Overview

Before embarking on an upgrade of the JS interpreter,
you need to know what all the different little pieces
are and how they relate to each other.

### Neil Fraser's JS-Interpreter Repository

[NeilFraser/JS-Intepreter](https://github.com/NeilFraser/JS-Interpreter)
is the main repository where development of the interpreter takes place. It gets updated
sporadically every 3-6 months or so. The goal of "upgrading the interpreter" is about
getting the updates in this repository to work on Code.org.

### Code.org's fork of Neil's JS-Interpreter

[code-dot-org/JS-Interpreter](https://github.com/code-dot-org/JS-Interpreter) is a fork
of Neil Fraser's interpreter which adds a bunch of developer oriented tooling like testing
and packaging, but otherwise has no changes to the interpreter itself. This fork
gets published as an npm package called
[@code-dot-org/js-interpreter](https://www.npmjs.com/package/@code-dot-org/js-interpreter)
which is then directly referenced in `apps/package.json`. This fork is kept around just
to make upgrading of the interpreter easier for us and hopefully the various
tooling improvements and versioning/packaging practices we've implemented will eventually
get merged upstream.

### The CustomMarshalingInterpreter class

This class is located in `apps/src/lib/tools/jsinterpreter/CustomMarshalingInterpreter.js`
and subclasses the `Interpreter` class provided by the `@code-dot-org/js-interpreter` package.
It adds additional functionality to support custom bi-directional marshaling of objects between
the interpreter and native javascript. In order to do this, it also overrides several private
`Interpreter` methods, which are often the cause of breaks when ugprading the interpreter. While
code in this class could theoretically get pushed upstream and become part of Neil's `Interpreter`
implementation, there are unfortnately some negative performance implications which make it
unsuitable for the core `Interpreter`.

### The JSInterpreter class

This class is located in `apps/src/lib/tools/jsinterpreter/JSInterpreter.js`
and wraps the `CustomMarshalingInterpreter` instance with an additional set
of APIs to support step debugging and breakpoints. It relies on private APIs
of the underlying `Interpreter` class to properly step between relevant interpreter
instructions.

### Miscellaneous Detritus

While the above represent the bulk of "interpreter code", there are an assortment of other places
in the code base that do unconventional things with the interpreter, like push custom stack frames
onto the interpreter's stack. They should all be considered areas of technical debt or legacy code
that is not to be repeated.

## Environment Setup

In order to properly test an upgrade, and debug/fix issues that might come up, there is a bit of
extra work to setup your development environment. Assuming you already have the
`code-dot-org/code-dot-org` repo setup locally, you need to do the following:

1. Check out, install, and link `code-dot-org/JS-Interpreter`:

   ```bash
   git clone git@github.com:code-dot-org/JS-Interpreter.git
   cd JS-Interpreter
   yarn install
   yarn link
   ```

2. Add `NeilFraser/JS-Interpreter` as a new git remote in your local `JS-Interpreter` clone

   ```bash
   git remote add upstream git@github.com:NeilFraser/JS-Interpreter.git
   git fetch --all
   ```

3. Switch your local `code-dot-org/code-dot-org` git clone to use your local `JS-Interpreter` instead
   of the one installed from npm:
   
   ```bash
   cd ../code-dot-org
   cd apps
   yarn link @code-dot-org/JS-Interpreter
   ```
   
## Performing an Upgrade

### Step 1: Test the upgrade locally against code-dot-org:

1. Merge the upstream commit that you'd like to upgrade to. Merging upstream master is a good way to start:
   in `JS-Interpreter`, run the following:

   ```bash
   git checkout -b master merge-upstream
   git merge upstream/master
   ```

1. Run interpreter related unit tests in `code-dot-org/apps`:

   ```bash
   yarn run test:entry -- --entry=./test/unit/lib/tools/jsinterpreter/
   ```
   
   If the tests don't pass, then the upgrade won't work without changes to one or more of the components
   outlined above. This is usually because of changes to private APIs which we are abusing. If the tests
   do pass, you can continue to the next step

1. Run the rest of the apps tests to make sure nothing else broke:

   ```bash
   ./test-low-memory.sh
   ```
   
### Step 2: Test the upgrade against the official ECMAScript test suite:

1. Push the `merge-upstream` branch you created in the previous step to github:

   ```bash
   git push origin merge-upstream
   ```

1. Create a new pull request to merge `code-dot-org/JS-Interpreter#merge-upstream` into `code-dot-org/JS-Interpreter#master`, for example by going to the following url: https://github.com/code-dot-org/JS-Interpreter/compare/master...code-dot-org:merge-upstream

1. Wait for the automated tests to run on your pull request. It is incredibly rare that an upgrade to the interpreter causes absolutely no regressions against the test262 ECMAScript test suite. The only question to ask about a failure is whether the regressions are acceptable or not. Unless something serious has broken in the interpreter, the regressions usually involve incredibly esoteric nuances of the JavaScript language that few if any people will encounter in real life on Code.org.

1. Check the fixes and regressions using `js-interpreter-tyrant` by downloading the test results from circle ci. You will need the circle ci build number:

   ```bash
   `yarn bin`/js-interpreter-tyrant --diff --verbose --circleBuild=<build number from circle ci>
   ```
   
1. Assuming the fixes and regressions after performing the upgrade are acceptable, save the test results and rerun the tests on circle by pushing the branch up to github:

   ```bash
   `yarn bin`/js-interpreter-tyrant --save --circleBuild=<build number from circle ci>
   git commit -am "Update saved test results"
   git push origin merge-upstream
   ```

   At this point the circle build should pass since it is only looking for _regressions_ and doesn't care about tests that have never passed in the first place. Assuming the tests pass, you can go ahead and merge the pull request into master.
   
### Step 3: Cut a new release of `@code-dot-org/js-interpreter`

1. Checkout and update your local master branch with the newly merged code from the pull request:

   ```bash
   git checkout master
   git pull origin
   ```
   
2. Bump the npm package version, and publish to npm:

   ```bash
   npm version patch
   git push origin master
   git push --tags
   npm publish --access public
   ```
   
### Step 4: Point code-dot-org/apps to the new version

1. Add the new version of the interpreter to package.json in `code-dot-org/apps`:

   ```bash
   yarn add @code-dot-org/js-interpreter@<new-version-number-here>
   ```

1. Follow the normal steps for submitting and merging a pull request in the `code-dot-org` repo.
