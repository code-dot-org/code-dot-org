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

## Package Overview

**api** - Wrappers for API calls to the backend and utilities for response validation, asynchronous fetches (`HttpClient`), and parsing URLs (`queryParams`).

**audio** - Systems for managing audio files and playback. Also includes TextToSpeech modules.

**blockly-workspace** - Package providing basic interfaces for creating Blockly blocks, plugins, and themes along with React components to render a plugin-aware, re-instantiatable Blockly workspace.

**component-library** - The base components for the UI across all other packages including `Button`, `Tabs`, etc.

**fonts** - The common package organizing the hosted fonts common to all frontend applications.

**lab-artist** - Lab for LOGO/Turtle-esque programmable drawing.

**lab-base** - Base interface for all labs.

**lab-blockly** - Base common interface for basic Blockly labs (Artist, Maze, etc.)

**lab-craft** - Minecraft programming activities.

**lab-frequency-analysis** - A lab that explores symmetric cryptography like Caesar ciphers.

**lab-karel** - A derivative of `lab-maze` that extends the maze activities with more complicated actions like collecting gems, honey, etc.

**lab-maze** - A simple Blockly-based lab where programmable agents attempt to reach a goal.

**lab-music** - Music Lab is a programmable block-based lab where students can create music.

**lab-panels**

**lab-standalone-video**

**localization**

**markdown**

**metrics**

**models**

**progress**

**projects**

**redux**

**teacher-dashboard**

**user**
