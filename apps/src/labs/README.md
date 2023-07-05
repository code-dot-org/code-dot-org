# Lab2

This folder contains the code for Lab2, which is our set of shared components and code for student labs.
Lab2 is the preferred set of components for a new lab, as opposed to our legacy system (which includes StudioApp.js
and project.js).

## Guidelines for Lab2
- Any code or component in `/labs` should be generic enough to be shared between multiple labs.
- Code should be written in typescript.
- Code should use functional React components.
- Loading a level should only require api calls, not server data.

## Features of Lab2
- Ability to switch between levels without page reload, if the levels are from a specific subset of labs.
  Right now Music Lab and StandaloneVideo levels can be switched between.
- A cleaner Project System, managed by ProjectManager.
- Shared wrapper components to handle various lab behaviors:
  - LabContainer: Manages showing and hiding a level based on load state
  - ProjectContainer: Manages loading project and level data for a level, and swapping that data out if
    the level changes

