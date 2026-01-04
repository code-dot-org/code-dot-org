# Code.org Frontend Packages

This directory contains all of the different pieces that make up our frontend applications.
This document will guide you through the different pieces one-by-one in logical groups relating
to the purpose and scope of each package.

## Configuration and Core Packages

There are a set of packages that just store common configuration files that are referenced by
each other package in order to maintain consistency across the packages without duplicating
their contents.

The [`@code-dot-org/fonts`](./fonts) package maintains the fonts and icon packages that are used within
the application. This includes the FontAwesome package.

The [`@code-dot-org/lint-config`](./lint-config) package contains some of the base configurations for eslint, stylelint, typescript, prettier, and lint-staged.

## Component Library

The [`@code-dot-org/component-library`](./component-library) package contains the basic ingredients to our UI. This
contains the UI theming for our UI package (Material UI) and some basic core components that
create a consistent student and teacher experience throughout the site.

## API

The [`@code-dot-org/api`](./api) package contains the various logic that fetches data from corresponding
API routes served via our backend server, which is maintained in a different ecosystem off of
the `/dashboard` directory of the repository as a Rails application.

The [`@code-dot-org/api/models`](./api/models) namespace includes the types for different data models in the
system that correspond mostly to our database records. This data is generally what is pulled
from the backend server and is the expected payload that is marshalled throughout the other
parts of the application.

## Redux

Our frontend application has a legacy dependency on Redux and makes use of the `redux-toolkit` library
to maintain a global data store available to various downstream components via selectors. Our
core
[`@code-dot-org/redux`](./redux) package is the central store and implements a modular Redux store that is
augmented as other packages holding slices come online during the frontend application lifetime.

See [redux/README](./redux/README.md) for more information.

## Platform Packages

The next set of packages provide substantial aggregrate functionality, but are still
otherwise core and used by a number of other packages.

The [`@code-dot-org/audio`](./audio) package provides a sound and music manager that can load, play, pause, and stop a variety of sounds. This package attempts to smooth over different compatibility issues across browsers and devices.

The [`@code-dot-org/markdown`](./markdown) package provides our Markdown component to render markdown content with our component library typography.

The [`@code-dot-org/localization`](./localization) package provides a means to interact with
the Localization engine and aid in marking content for translation using our translation
system (LocalizeJS).

The [`@code-dot-org/metrics`](./metrics) package provides interfaces for user metrics and analytics.

## Blockly

The [`@code-dot-org/blockly-workspace`](./blockly-workspace`) package maintains our Blockly workspace wrapper and
novel plugin system. This package is the base of all Blockly labs and other Blockly needs
across the site.

The different plugin interfaces allow individual labs to maintain their own blocks, fields,
and augmentation while we smooth over differences among them in this package such that we
can keep our Blockly import at the latest version.

## Progress and Projects

## Teacher Dashboard

## Labs

All labs are built off of the [`@code-dot-org/lab`](./labs/base) package. This package
contains the different interfaces that all labs need to support or emit to be used in a
modular way in our frontend applications.

Generally, all actual lab packages is a Vite application.

### Music Lab

The [`@code-dot-org/music-lab`](./labs/music) package implements the Music Lab application.
This application serves Music Lab levels, which are Blockly-based programming exercises that
utilize pieces of music which students can arrange to form their own mixes via code.

### Standalone Video

The [`@code-dot-org/standalone-video`](./labs/standalone-video`) package implements a very
basic application for rendering a video as a level.
