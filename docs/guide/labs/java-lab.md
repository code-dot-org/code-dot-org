---
title: Java Lab
description: Reference for the Java Lab workspace — the text editor, file tabs, Javabuilder Console, Backpack, and Theater view.
type: reference
---

Java Lab is the Java development environment for the CS A course. Code compiles and runs on a remote Javabuilder server; results appear in the console or in a Theater view for graphical output. Access requires a verified instructor.

For tasks common to all levels, see [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/).

![The Java Lab workspace showing the main regions of the editor](images/java-lab-workspace.png)

## Code editor

![The editor tabs showing file names along the top of the editor](images/java-lab-editor-tabs.png)

The editor provides Java syntax highlighting and line numbers. Projects with multiple source files show tabs along the top of the editor; select a tab to switch files. The editor supports undo and redo.

Some levels include read-only starter files that you can view but not modify.

## Javabuilder Console

The console sits below the editor. It shows:

- **Compilation errors** — line number, file name, and the error message. Common errors include missing semicolons, unresolved symbols, and type mismatches.
- **Runtime output** — anything written by `System.out.println`.
- **Runtime exceptions** — stack traces for uncaught exceptions.

## Theater view

Levels configured for graphical output display a Theater panel instead of or alongside the console. The Theater renders the visual output of the program (drawings, animations, or interactive displays built with the Painter or Theater APIs).

## Backpack

![The Backpack icon in the toolbar](images/java-lab-backpack.png)

The Backpack is a persistent clipboard that lets you save code snippets across levels. Select the Backpack icon in the toolbar to open it, then drag code in or out.

## Run and Stop

![The Run button](images/java-lab-run-button.png)

Select **Run** to send the code to the Javabuilder server for compilation and execution. Compilation takes a few seconds. If compilation fails, errors appear in the console and the program does not run. Select **Stop** to end a running program.

## Commit and version history

Java Lab supports committing code snapshots. Select **Commit** to save a named version. Select **Version History** to view and restore earlier commits.

## Troubleshooting

### Run does nothing or times out

The Javabuilder server must be reachable. If the connection fails, the console shows a connection error. Network restrictions (school firewalls blocking WebSocket connections to `javabuilder.code.org`) can cause this.

### Compilation errors

Read the first error message — later errors are often caused by the first one. Fix the reported line and recompile before addressing subsequent messages.

## Further reading

- [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/)
- [Labs overview](/guide/labs/)
