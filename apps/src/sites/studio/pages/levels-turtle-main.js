Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "loadArtist" */ './init/loadArtist')
]).then(([{default: loadAppOptions}, {default: loadArtist}]) =>
  loadAppOptions().then(loadArtist)
);
