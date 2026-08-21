# pythonlab-packages
This repository consists of packages for use in Python Lab. This can contain any library we want to expose to
students or any patches we want to apply to student code. Here are the current packages:

### neighborhood
This package contains the python neighborhood package used in pythonlab. It is based on the javalab [`org.code.neighborhood`](https://github.com/code-dot-org/javabuilder/tree/main/org-code-javabuilder/neighborhood/src/main/java/org/code/neighborhood) package and includes the `Painter` class.

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

### unittest_runner
This tests adds some customization to the output of unit tests, and has a function to either run validation tests
(more customized) or student tests (less customized).

### theater
This package contains the python theater package used in pythonlab. It is based on the Java Lab [`org.code.theater`](https://github.com/code-dot-org/javabuilder/tree/main/org-code-javabuilder/theater) package and includes the `Scene` class and `play_scenes` function. A scene records drawing and audio commands; `play_scenes` renders them into an animated gif (via Pillow) and a WAV audio track (via numpy and the stdlib `wave` module) and returns the raw bytes. Instrument note samples and the Liberation fonts used for text are bundled as package data and read via `importlib.resources`, since network fetch is unavailable under Pyodide's `jsglobals: {}`.

The instrument notes are stored as headerless 8-bit mu-law at 22.05 kHz rather than as WAV files, and `theater/support/instrument_samples.py` decodes them back to the output rate on load. The theater wheel is fetched only for a program that imports `theater`, not on every Python Lab page load (see `ON_DEMAND_PACKAGE_URLS` in `apps/src/pythonlab/pythonHelpers/pythonScriptUtils.ts`). Size still matters: the fetch lands on the first run of a theater level, while the student waits.

`play_scenes` also hands both to the host for playback, through `theater/support/bridge.py`. That calls `_theater_bridge.publish(gif_bytes, wav_bytes)`, a JS module the Pyodide web worker registers — the only route out of the interpreter under `jsglobals: {}`. `wav_bytes` is `None` for a program that made no sound, which the host reads as "no audio to wait on". In any other interpreter the module is absent and publishing is a no-op, which is what lets the tests render gifs without a browser.

## Building a package
From the package folder containing `pyproject.toml`, run `uv build`. The generated `.whl` file will be in the `code-dot-org/dist` folder.
The generated `.whl` file can then be copied to [apps/lib/pyodide](../../apps/lib/pyodide/).

### TODO

From CI run `uv build` automatically when folder content changes, and copy the resulting `.whl` to apps/lib/pyodide.

## Run tests
From the folder containing code and tests, run `uv run pytest`. This will look for tests in all files that start with `test` in the `tests/` sub-directory.
