Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "loadScratch" */ './init/loadScratch')
]).then(([{default: loadAppOptions}, {default: loadScratch}]) =>
  loadAppOptions().then(loadScratch)
);
