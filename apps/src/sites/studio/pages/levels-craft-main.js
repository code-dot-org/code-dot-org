Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "apps" */ './init/loadCraft')
]).then(([{default: loadAppOptions}, {default: loadCraft}]) =>
  loadAppOptions().then(loadCraft)
);
