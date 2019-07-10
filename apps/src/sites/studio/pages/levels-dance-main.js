Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "loadDance" */ './init/loadDance')
]).then(([{default: loadAppOptions}, {default: loadDance}]) =>
  loadAppOptions().then(loadDance)
);
