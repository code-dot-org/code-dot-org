// Timing harness: the exact config `yarn build` (DEV=1 grunt build ->
// webpack:build) uses, invocable directly via webpack CLI so the grunt
// prebuild (already seeded) is skipped.
const {createWebpackConfig} = require('./webpack.config');

module.exports = createWebpackConfig({
  minify: process.env.NODE_ENV === 'production',
});
