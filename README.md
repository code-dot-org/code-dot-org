# Code.org

Welcome! You've found the source code for [the Code.org website](https://code.org/) and [the Code Studio platform](https://studio.code.org/). Code.org is a non-profit dedicated to expanding access to computer science education. You can read more about our efforts at [code.org/about](https://code.org/about).

## Quick start

1. Install docker
2. `docker-compose up`
3. Open your browser to [http://localhost:3000/](http://localhost:3000/).

To load our curriculum and locale data, you'll also need to check out these repositories:
- [code-dot-org-curriculum](https://github.com/unlox775-code-dot-org/code-dot-org-curriculum-content)
- [code-dot-org-locale](https://github.com/unlox775-code-dot-org/code-dot-org-locale-content)

NOTE: if you'd like to run without docker, you can follow the instructions in [BUILD-STEPS.md](./BUILD-STEPS.md).

## How to help

Wondering where to start?  See our [contribution guidelines](CONTRIBUTING.md).

## What's in this repo?
Here's a quick overview of the major landmarks:

### Documentation

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

### [apps](./apps)

The JavaScript 'engine' for all of our tutorials, puzzle types and online tools.  It gets built into a static package that we serve through dashboard. Though there are currently some exceptions, the goal is that all JS code ultimately lives here, so that it gets the benefit of linting/JSX/ES6/etc.
Start here if you are looking for:
* The Hour of Code tutorials: [Star Wars](https://code.org/starwars), [Minecraft](https://code.org/api/hour/begin/mc), [Frozen](https://studio.code.org/s/frozen) and [Classic Maze](http://studio.code.org/hoc/1)
* Tools like [Artist](https://studio.code.org/projects/artist), [Play Lab](https://studio.code.org/projects/playlab) and [App Lab](https://code.org/educate/applab)
* Other core puzzle types: Maze, Farmer, Bee, Bounce, Calc, Eval
* Other JS code consumed by dashboard.

### Everything else

* **bin**: Developer utilities.
* **shared**: Source and assets used by many parts of our application.
* **tools**: Git commit hooks.


