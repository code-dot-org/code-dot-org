Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "apps" */ './init/loadNetSim')
]).then(([{default: loadAppOptions}, {default: loadNetSim}]) =>
  loadAppOptions().then(loadNetSim)
);
