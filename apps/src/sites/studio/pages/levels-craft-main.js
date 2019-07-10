Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "loadCraft" */ './init/loadCraft')
]).then(([{default: loadAppOptions}, {default: loadCraft}]) =>
  loadAppOptions().then(loadCraft)
);
