Promise.all([
  import(/* webpackChunkName: "loadApp" */ '@cdo/apps/code-studio/initApp/loadApp'),
  import(/* webpackChunkName: "loadMaze" */ './init/loadMaze')
]).then(([{default: loadAppOptions}, {default: loadMaze}]) =>
  loadAppOptions().then(loadMaze)
);
