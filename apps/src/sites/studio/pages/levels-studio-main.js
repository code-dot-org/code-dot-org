Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "loadStudio" */ './init/loadStudio')
]).then(([{default: loadAppOptions}, {default: loadStudio}]) =>
  loadAppOptions().then(loadStudio)
);
