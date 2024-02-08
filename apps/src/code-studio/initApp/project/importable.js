/*

  Sigh. Okay, this file exists for one and -only- one reason - it's to bust up a circular dependency
  in the project.js file. project.js was importing `clientApi.js`, which also imported `projects.js`

  So.

  We short circuit it. This file lives up outside of the hierarchy and -only- contains a reference to the
  object exported by initApp/project.js. It starts off undefined so we'll get exceptions tossed if any of
  its methods are called early. Once the project.js file is actually loaded up later on, it'll also import this file and set
  the variable to itself, which then makes it available to the clientApi.js file at run time.

  This is an awful hack and points to future refactoring being necessary.

*/

export let project = undefined;

export const setProject = newProject => (project = newProject);
