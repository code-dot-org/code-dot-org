# Code.org

[![Coverage Status](https://codecov.io/gh/code-dot-org/code-dot-org/branch/staging/graph/badge.svg)](https://codecov.io/gh/code-dot-org/code-dot-org)

Welcome! You've found the source code for [the Code.org website](https://code.org/) and [the Code Studio platform](https://studio.code.org/). Code.org is a non-profit dedicated to expanding access to computer science education. You can read more about our efforts at [code.org/about](https://code.org/about).

## Quick start

1. Follow our [setup guide](./SETUP.md) to configure your workstation.
2. `rake build` to build the application if you have not done so already
3. `bin/dashboard-server` to launch the development server.
4. Open your browser to [http://localhost-studio.code.org:3000/](http://localhost-studio.code.org:3000/).

To see a list of all build commands, run `rake` from the repository root.

## How to help

Wondering where to start?  See our [contribution guidelines](CONTRIBUTING.md).

## What's in this repo?
Here's a quick overview of the major landmarks:

### Documentation

* [SETUP](./SETUP.md): Instructions to get everything up and running.
* [TESTING](./TESTING.md): How to be sure nothing broke.
* [STYLEGUIDE](./STYLEGUIDE.md): Our code style conventions.
* Our [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
* There are many more topical guides in the [docs](./docs) folder.
* In addition, several sections of the repository have their own documentation:
  * [apps/README](./apps/README.md)
  * [blockly/README](https://github.com/code-dot-org/blockly/blob/master/README.md)

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

### [apps](./apps)

The JavaScript 'engine' for all of our tutorials, puzzle types and online tools.  It gets built into a static package that we serve through dashboard. Though there are currently some exceptions, the goal is that all JS code ultimately lives here, so that it gets the benefit of linting/JSX/ES6/etc.
Start here if you are looking for:
* The Hour of Code tutorials: [Star Wars](https://code.org/starwars), [Minecraft](https://code.org/api/hour/begin/mc), [Frozen](https://studio.code.org/s/frozen) and [Classic Maze](http://studio.code.org/hoc/1)
* Tools like [Artist](https://studio.code.org/projects/artist), [Play Lab](https://studio.code.org/projects/playlab) and [App Lab](https://code.org/educate/applab)
* Other core puzzle types: Maze, Farmer, Bee, Bounce, Calc, Eval
* Other JS code consumed by dashboard and pegasus.

### Everything else

* **aws**: Configuration and scripts that manage our deployments.
* **bin**: Developer utilities.
* **cookbooks**: Configuration management through [Chef](https://www.chef.io/).
* **shared**: Source and assets used by many parts of our application.
* **tools**: Git commit hooks.

