[![Build Status](https://travis-ci.org/code-dot-org/code-dot-org.svg?branch=staging)](https://travis-ci.org/code-dot-org/code-dot-org) on Travis

[![Circle CI](https://circleci.com/gh/code-dot-org/code-dot-org/tree/staging.svg?style=svg)](https://circleci.com/gh/code-dot-org/code-dot-org/tree/staging) on Circle

[![Coverage Status](https://coveralls.io/repos/github/code-dot-org/code-dot-org/badge.svg?branch=staging)](https://coveralls.io/github/code-dot-org/code-dot-org?branch=staging) for dashboard unit tests


# Build setup
This [Setup](./SETUP.md) document describes how to set up your workstation to develop for Code.org.

# Codebase

## Organizational Structure

Our code is segmented into four parts:

* Blockly Core is the visual programming language platform used for the interactive tutorials.
* Blockly includes apps—blockly puzzles built based on Blockly Core.
  * [Hour of Code](http://studio.code.org/hoc/1)
* Dashboard, is the tutorial platform which organizes blockly levels into tutorials.
  * [Code Studio](http://studio.code.org)
* Pegasus is the main site which also includes the teacher dashboard (support for teachers to track student progress).
  * [code.org](http://code.org)
  * [csedweek.org](http://csedweek.org)
  * [Teacher Dashboard](http://code.org/teacher-dashboard)

## Running Dashboard

1. `cd code-dot-org`
2. `rake build:dashboard` (Generally, do this after each pull)
3. `bin/dashboard-server`
4. Visit [http://localhost.studio.code.org:3000/](http://localhost.studio.code.org:3000/)

## Running Pegasus

1. `cd code-dot-org`
2. `rake build:pegasus` (Generally, do this after each pull)
3. `bin/pegasus-server`
4. Visit [http://localhost.code.org:3000/](http://localhost.code.org:3000/)

## Building Javascript (apps, blockly-core, and code-studio) (optional)

The studio.code.org default dashboard install includes a static build of blockly and of code-studio js, but if you want to make modifications to these you'll want to enable building them in the build:

### Enabling Apps Builds

You'll need to do this once:

1. OS X:
  1. Install the [Java 8 JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html)
1. `cd code-dot-org`
1. To build apps/blocky-core, edit `locals.yml` to add:
  1. Add `build_apps: true`
  1. Add `build_blockly_core: true` (if you want to build blockly core -- not necessary if you only want to make changes to apps)
  1. Add `use_my_apps: true`
1. To build code_studio js, edit `locals.yml` to add:
  1. Add `use_my_code_studio: true`
1. `rake install`

This configures your system to build apps/blockly-core/code-studio whenever you run `rake build` and to use the versions that you build yourself.

### Building

1. `cd code-dot-org`
1. `rake build`

This will build everything you have set to build in `locals.yml`.

You can use `rake build:apps`, `rake build:blockly_core` and `rake build:code_studio` to build a specific project.

You can also set `build_dashboard: false` and/or `build_pegasus: false` in `locals.yml` if you don't need to build these frequently. They default to `true`.

Alternatively, you can run: `rake build:core_and_apps_dev`, which will build blockly core and the apps bundle without running tests and without localization.

## Contributing

Wondering where to start?  See our [contribution guidelines](CONTRIBUTING.md)
for more information on helping us out.
