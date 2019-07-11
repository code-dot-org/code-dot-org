Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "apps" */ './init/loadStudio')
]).then(([{default: loadAppOptions}, {default: loadStudio}]) =>
  loadAppOptions().then(loadStudio)
);
