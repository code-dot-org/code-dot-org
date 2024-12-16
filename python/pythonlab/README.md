# pythonlab-packages
This repository consists of packages for use in Python Lab. This can contain any library we want to expose to
students or any patches we want to apply to student code. Here are the current packages:

### pythonlab_setup
This package handles setup and teardown for Python Lab. For setup, it patches libraries for use in Python Lab.
The current patches are:
- We patch `matplotlib` in order to display graphs correctly. The patch updates the `show` method to send
  a base64 encoded string for display in Python Lab.
- We patch `requests` in order to route requests through code.org's request proxy. This protects students
  by only allowing requests to an allow-list of urls.

We run `setup_pythonlab()`, a method this package exposes, before each student run, which only applies
the matplotlib patch for now. We also run `teardown_pythonlab()` after each run, which flushes stdout and
changes directory to the home folder.

## unittest_runner
This tests adds some customization to the output of unit tests, and has a function to either run validation tests
(more customized) or student tests (less customized).

## Building a package
From the package folder containing `pyproject.toml`, run `pdm build`. The generated `.whl` file will be in the `dist` folder.
The generated `.whl` file can then be copied to [apps/lib/pyiodide](../../apps/lib/pyodide/).

### TODO

From CI run `pdm build` automatically when folder content changes, and copy the resulting `.whl` to apps/lib/pyodide.

## Run tests
From the folder containing code and tests, run `pdm run pytest`. This will look for tests in all files that start with `test` in the `tests/` sub-directory.
