Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "apps" */ './init/loadJigsaw')
]).then(([{default: loadAppOptions}, {default: loadJigsaw}]) =>
  loadAppOptions().then(loadJigsaw)
);
