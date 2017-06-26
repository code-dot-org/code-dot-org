# Upgrading the JS Interpreter

## Component Overview

Before embarking on an upgrade of the JS interpreter,
you need to know what all the different little pieces
are and how they relate to each other.

### Neil Fraser's JS-Interpreter Repository

[Neil Fraser's JS-Intepreter github repo](https://github.com/NeilFraser/JS-Interpreter)
is the main repository where development of the interpreter takes place. It gets updated
sporadically every 3-6 months or so. The goal of "upgrading the interpreter" is about
getting the updates in this repository to work on code.org.

### Code.org's "fork" of Neil's JS-Interpreter

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

This class is located in 
