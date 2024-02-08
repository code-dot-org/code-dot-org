/*

  Sigh. Okay, this file exists for one and -only- one reason - it's to bust up a circular dependency
  in the project.js file. project.js was importing `header.js`, which marched along a big circle until
  coming back to project.js where it was trying to bring in the project object to save things.

  So.

  We short circuit it. This file lives up outside of the hierarchy and -only- contains a reference to the
  object exported by code-studio/header.js. It starts off as a minimal object that'll just throw exceptions
  if any of the functions are called. They shouldn't be called until run time, so this really is just being
  extra defensive. Once the header.js file is actually loaded up later on, it'll also import this file and set
  the variable to itself, which then makes it available to the project.js file at run time. The methods defined
  here are the ones that currently are called in the `project.js` file.

  This is an awful hack and points to future refactoring being necessary.

*/

const getThrowExceptionMethod = name => {
  throw new Error(
    `header object called in project before definition: ${name} does not yet exist`
  );
};

export let header = {
  hideTryAgainDialog: getThrowExceptionMethod('hideTryAgainDialog'),
  showHeaderForProjectBacked: getThrowExceptionMethod(
    'showHeaderForProjectBacked'
  ),
  showMinimalProjectHeader: getThrowExceptionMethod('showMinimalProjectHeader'),
  showProjectHeader: getThrowExceptionMethod('showProjectHeader'),
  showProjectSaveError: getThrowExceptionMethod('showProjectSaveError'),
  showProjectSaving: getThrowExceptionMethod('showProjectSaving'),
  showTryAgainDialog: getThrowExceptionMethod('showTryAgainDialog'),
  updateTimestam: getThrowExceptionMethod('updateTimestam'),
};

export const setProjectHeader = newHeader => (header = newHeader);
