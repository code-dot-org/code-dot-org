Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "loadFlappy" */ './init/loadFlappy')
]).then(([{default: loadAppOptions}, {default: loadFlappy}]) =>
  loadAppOptions().then(loadFlappy)
);
