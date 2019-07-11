Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "apps" */ './init/loadArtist')
]).then(([{default: loadAppOptions}, {default: loadArtist}]) =>
  loadAppOptions().then(loadArtist)
);
