Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "loadEval" */ './init/loadEval')
]).then(([{default: loadAppOptions}, {default: loadEval}]) =>
  loadAppOptions().then(loadEval)
);
