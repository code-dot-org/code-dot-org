// All non-peer dependencies are bundled into dist by vite (externalizeDeps({deps:false})).
// Strip both dependency sections from the published manifest — consumers only need peers.
module.exports = {
  remove: ['dependencies', 'devDependencies'],
};
