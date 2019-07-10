Promise.all([
  import('@cdo/apps/code-studio/initApp/loadApp'),
  import('./init/loadApplab')
]).then(([{default: loadAppOptions}, {default: loadApplab}]) =>
  loadAppOptions().then(loadApplab)
);
