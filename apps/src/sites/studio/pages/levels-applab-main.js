Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "apps" */ './init/loadApplab')
]).then(([{default: loadAppOptions}, {default: loadApplab}]) =>
  loadAppOptions().then(loadApplab)
);
