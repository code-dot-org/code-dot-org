---
title: Python Lab
description: Reference for the Python Lab workspace — the code editor, console, file tabs, and the Pyodide sandbox.
type: reference
---

Python Lab is a browser-based Python environment. Code runs inside a Pyodide sandbox on a separate domain from the main site, so student programs cannot access session data. There is nothing to install.

For tasks common to all levels, see [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/).

## Code editor

The code editor uses CodeMirror with Python syntax highlighting. Some levels have multiple file tabs along the top; select a tab to switch files. The editor supports undo and redo.

## Console

The console panel on the right shows output from `print()` and error tracebacks. When a program calls `input()`, the console pauses and displays a text field for the student to type a response. Press Enter to submit the input and resume execution.

Select **Clear Console** to remove old output.

## Run and Stop

Select **Run** to execute the program. Output appears line by line in the console. Select **Stop** to halt a running program (useful for infinite loops or long-running code).

## Pyodide sandbox

Python Lab uses Pyodide (CPython compiled to WebAssembly) running inside a hidden iframe on a sandboxed subdomain. The sandbox cannot access `studio.code.org` cookies or session data. Standard-library modules are available; third-party packages are not.

The `input()` function works through a service worker that intercepts the blocking call and waits for the student's response from the main thread.

## Troubleshooting

### The console shows a red error

Read the last line of the traceback for the error type and message. Common errors:

- **NameError** — a variable or function name is misspelled or not yet defined.
- **SyntaxError** — a colon, parenthesis, or quotation mark is missing.
- **IndentationError** — lines inside a block are not indented consistently.
- **TypeError** — an operation was applied to the wrong type (adding a string and an integer, for example).

The traceback includes a line number. The error is on that line or just before it.

### Nothing appears in the console

The program may have finished without calling `print()`. Add a `print()` call to see a value.

## Further reading

- [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/)
- [Labs overview](/guide/labs/)
