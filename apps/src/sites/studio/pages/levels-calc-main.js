Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "loadCalc" */ './init/loadCalc')
]).then(([{default: loadAppOptions}, {default: loadCalc}]) =>
  loadAppOptions().then(loadCalc)
);
