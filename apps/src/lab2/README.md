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

## How to Create a New Lab

As of 2024, all new labs should be based on Lab2. To create a new lab, you need to do the following:

- Backend changes (ruby):
  - Backend changes can be modeled off [the initial aichat PR](modeled off [this PR](https://github.com/code-dot-org/code-dot-org/pull/52538))
  - Set up the new [level](https://github.com/code-dot-org/code-dot-org/pull/52538/files#diff-3c5dedf7c252ccdfebcad7b26ddc2b4e1d2cad5c5d4257943802c0af06fb7c83R1) and [game type](https://github.com/code-dot-org/code-dot-org/pull/52538/files#diff-ff86f86a12d97e95649d41a3da445d7e1fb3cdcf69ef4112e1c8d8a02fee7233R62), and add the new level to [levels_controller](https://github.com/code-dot-org/code-dot-org/pull/52538/files#diff-fb10c591e5aa0c82109ab9b5e3d5aac6f7ffdf5ebb2717de405afa7c661dd650R20). This is unchanged from how our previous labs were set up.
  - Override [uses_lab2](https://github.com/code-dot-org/code-dot-org/pull/52538/files#diff-3c5dedf7c252ccdfebcad7b26ddc2b4e1d2cad5c5d4257943802c0af06fb7c83R48) in the new level file and return true.
  - There are a few other minor backend changes required, see the linked PR.
- Frontend Changes (ts/js):
  - Set up your new lab react views on the frontend. See the apps/aichat folder in this [PR](https://github.com/code-dot-org/code-dot-org/pull/52538/files).
  - Register your lab with lab2, these steps have changed since the aichat PR so we'll be looking at an example from pythonlab instead:
    - Define a new entrypoint for your lab, see [apps/pythonlab/entrypoint.ts](https://github.com/code-dot-org/code-dot-org/pull/59794/files#diff-0dbe9f4f6eecfd5cb5e653b9d592bacbaaf6368602e32a1c357ce7c9067f0cdb)
      - DO: use `view:` with a dynamic import() call with a webpack chunk name defined
      - DO NOT: use `hardcodedView:` with a static import of your react view, even if you see examples doing this (why: this results in all lab2 code being loaded in a huge mega-bundle)
    - Create an index.js file for your lab, see [apps/pythonlab/index.js](https://github.com/code-dot-org/code-dot-org/blob/b81b6b98f1ecc01972bf2ae43589b06c40e6183c/apps/src/pythonlab/index.js), this is required to make our typescript config work with dynamic imports.
    - Add the new lab type to [apps/lab2EntryPoints.ts](https://github.com/code-dot-org/code-dot-org/blob/b81b6b98f1ecc01972bf2ae43589b06c40e6183c/apps/lab2EntryPoints.ts#L21)

That’s it!

## Supported level types

Currently, the following level apps are built for **Lab2**:

- [Music](../music/)
- [Panels](../panels/)
- [StandaloneVideo](../standaloneVideo)

The full list of supported level apps, along with their associated properties, is declared in `LabViewsRenderer` [here](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/src/lab2/views/LabViewsRenderer.tsx#L47).

**Music** drove the initial implementation of **Lab2**.
