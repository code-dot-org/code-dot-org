# Lab2

This folder contains the code for **Lab2**, which is our set of shared components and code for student labs. **Lab2** is the preferred set of components for a new lab, as opposed to our legacy system (which includes `StudioApp.js` and `project.js`).

## Guidelines for **Lab2**
- Any code or component in `/lab2` should be generic enough to be shared between multiple labs.
- Code should be written in TypeScript.
- Code should use functional React components.
- When loading a lab as a `ScriptLevel` page, the lab part of the server-rendered page should not have any level- or user-specific data. That information should be loaded afterwards using asynchronous calls to server APIs. This allows the page to be cached independent of the user, and also allows the page to switch levels to other supported variants without a reload.

## Features of **Lab2**
- Ability to switch between levels without page reload, if the levels are from a specific subset of labs.
- A cleaner [project system](./projects/), managed by `ProjectManager`.
- A new [progress system](./progress/).
- A new instructions UI component.
  - Displays instructions, with support for clickable text.
  - Displays validation feedback messages from the new progress system.
  - Displays a "Continue" to next level message when validation passes.
- Shared wrapper components to handle various lab behaviors:
  - `Lab2Wrapper`: Manages showing and hiding a level based on load state.
  - `ProjectContainer`: Manages loading project and level data for a level, and swapping that data out if the level changes.
- An error boundary which catches errors, reports them, and displays an error message.

## Supported level types

Currently, the following level apps are built for **Lab2**:
- [Music](../music/)
- [Panels](../panels/)
- [StandaloneVideo](../standaloneVideo)

The full list of supported level apps, along with their associated properties, is declared in `LabViewsRenderer` [here](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/src/lab2/views/LabViewsRenderer.tsx#L47).

**Music** drove the initial implementation of **Lab2**.
