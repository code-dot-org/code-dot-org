Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "loadNetSim" */ './init/loadNetSim')
]).then(([{default: loadAppOptions}, {default: loadNetSim}]) =>
  loadAppOptions().then(loadNetSim)
);
