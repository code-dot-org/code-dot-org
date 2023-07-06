# Lab2

This folder contains the code for Lab2, which is our set of shared components and code for student labs. Lab2 is the preferred set of components for a new lab, as opposed to our legacy system (which includes StudioApp.js and project.js).

## Guidelines for Lab2
- Any code or component in `/lab2` should be generic enough to be shared between multiple labs.
- Code should be written in TypeScript.
- Code should use functional React components.
- When loading a lab as a ScriptLevel page, the lab part of the server-rendered page should not have any level- or user-specific data. That information should be loaded afterwards using asynchronous calls to server APIs. This allows the page to be cached independent of the user, and also allows the page to switch levels to other supported variants without a reload.

## Features of Lab2
- Ability to switch between levels without page reload, if the levels are from a specific subset of labs.
- A cleaner Project System, managed by ProjectManager.
- Shared wrapper components to handle various lab behaviors:
  - Lab2Wrapper: Manages showing and hiding a level based on load state.
  - ProjectContainer: Manages loading project and level data for a level, and swapping that data out if the level changes.

