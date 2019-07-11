Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "apps" */ './init/loadWeblab')
]).then(([{default: loadAppOptions}, {default: loadWeblab}]) =>
  loadAppOptions().then(loadWeblab)
);
