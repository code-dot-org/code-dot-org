# Code.org

[![Build Status](https://travis-ci.org/code-dot-org/code-dot-org.svg?branch=staging)](https://travis-ci.org/code-dot-org/code-dot-org)
[![Circle CI](https://circleci.com/gh/code-dot-org/code-dot-org/tree/staging.svg?style=svg)](https://circleci.com/gh/code-dot-org/code-dot-org/tree/staging)
[![Coverage Status](https://coveralls.io/repos/github/code-dot-org/code-dot-org/badge.svg?branch=staging)](https://coveralls.io/github/code-dot-org/code-dot-org?branch=staging)

Welcome! You've found the source code for [the Code.org website](https://code.org/) and [the Code Studio platform](https://studio.code.org/). Code.org is a non-profit dedicated to expanding access to computer science education. You can read more about our efforts at [code.org/about](https://code.org/about).

## Quick start

1. Follow our [setup guide](./SETUP.md) to configure your workstation.
2. `rake build` to build the application.
3. `bin/dashboard-server` to launch the development server.
4. Open your browser to [http://localhost-studio.code.org:3000/](http://localhost-studio.code.org:3000/).

## How to help

Wondering where to start?  See our [contribution guidelines](CONTRIBUTING.md).

## What's in this repo?
Here's a quick overview of the major landmarks:

### [dashboard](./dashboard)

The server for our [**Code Studio** learning platform](https://studio.code.org/), a [Ruby on Rails](http://rubyonrails.org/) application responsible for:

* Our courses, tutorials, and puzzle configurations
* User accounts
* Student progress and projects
* The "levelbuilder" content creation tools

### [pegasus](./pegasus)

The server for [the **Code.org** website](https://code.org/), a [Sinatra](http://www.sinatrarb.com/) application responsible for:

* [code.org](https://code.org)
* [hourofcode.com](https://hourofcode.com)
* [csedweek.org](https://csedweek.org)
* [Teacher Dashboard](http://code.org/teacher-dashboard)

### [apps](./apps)

The JavaScript 'engine' for all of our tutorials, puzzle types and online tools.  It gets built into a static package that we serve through dashboard.  Start here if you are looking for:
* The Hour of Code tutorials: [Star Wars](https://code.org/starwars), [Minecraft](https://code.org/api/hour/begin/mc), [Frozen](https://studio.code.org/s/frozen) and [Classic Maze](http://studio.code.org/hoc/1)
* Tools like [Artist](https://studio.code.org/projects/artist), [Play Lab](https://studio.code.org/projects/playlab) and [App Lab](https://code.org/educate/applab)
* Other core puzzle types: Maze, Farmer, Bee, Bounce, Calc, Eval

### [code-studio](./code-studio)

JavaScript code specific to our **Code Studio** learning platform.  This also becomes a static package served by dashboard, and is tightly coupled to dashboard code.

### Documentation

* [SETUP](./SETUP.md): Instructions to get everything up and running.
* [TESTING](./TESTING.md): How to be sure nothing broke.
* [STYLEGUIDE](./STYLEGUIDE.md): Our code style conventions.
* Our [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
* In addition, several sections of the repository have their own documentation:
  * [apps/README](./apps/README.md)
  * [blockly-core/README](./blockly-core/README.md)
  * [code-studio/README](./code-studio/README.md)

### Everything else

* **aws**: Configuration and scripts that manage our deployments.
* **bin**: Developer utilties.
* **blockly-core**: Our custom version of [Google Blockly](https://developers.google.com/blockly/), the visual programming language used for many of our interactive tutorials.
* **cookbooks**: Configuration management through [Chef](https://www.chef.io/).
* **docs**: Additional documentation.
* **shared**: Source and assets used by many parts of our application.
* **tools**: Git commit hooks.



## Running parts of the application

### Running Dashboard

1. `cd code-dot-org`
2. `rake build:dashboard` (Generally, do this after each pull)
3. `bin/dashboard-server`
4. Visit [http://localhost.studio.code.org:3000/](http://localhost.studio.code.org:3000/)

### Running Pegasus

1. `cd code-dot-org`
2. `rake build:pegasus` (Generally, do this after each pull)
3. `bin/pegasus-server`
4. Visit [http://localhost.code.org:3000/](http://localhost.code.org:3000/)

### Building Javascript (apps, blockly-core, and code-studio) (optional)

The studio.code.org default dashboard install includes a static build of blockly and of code-studio js, but if you want to make modifications to these you'll want to enable building them in the build:

#### Enabling Apps Builds

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
1. `rake package`

This configures your system to build apps/blockly-core/code-studio whenever you run `rake build` and to use the versions that you build yourself.

### Building

1. `cd code-dot-org`
1. `rake build`

This will build everything you have set to build in `locals.yml`.

You can use `rake build:apps`, `rake build:blockly_core` and `rake build:code_studio` to build a specific project.

You can also set `build_dashboard: false` and/or `build_pegasus: false` in `locals.yml` if you don't need to build these frequently. They default to `true`.

Alternatively, you can run: `rake build:core_and_apps_dev`, which will build blockly core and the apps bundle without running tests and without localization.


