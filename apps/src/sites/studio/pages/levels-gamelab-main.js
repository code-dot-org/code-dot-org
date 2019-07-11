Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "loadGamelab" */ './init/loadGamelab')
]).then(([{default: loadAppOptions}, {default: loadGamelab}]) =>
  loadAppOptions().then(loadGamelab)
);
