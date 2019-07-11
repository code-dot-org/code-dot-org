Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "loadBounce" */ './init/loadBounce')
]).then(([{default: loadAppOptions}, {default: loadBounce}]) =>
  loadAppOptions().then(loadBounce)
);
