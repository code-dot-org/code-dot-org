/**
 * @file Bundler-agnostic build facts for apps/: what to transpile, how
 * names resolve, what stays external, and how output splits into
 * chunks.  webpack.config.js and rspack.config.js both consume this
 * module so the two descriptions cannot drift; each instantiates its
 * own plugins from the values here, and nothing in this file may
 * import a bundler.  If rspack support is ever removed, this file
 * remains the app's build description — or folds mechanically back
 * into webpack.config.js, where these definitions lived before.
 */
const path = require('path');

const circularDependencies = require('./circular_dependencies.json');
const {
  CODE_STUDIO_ENTRIES,
  INTERNAL_ENTRIES,
  PROFESSIONAL_DEVELOPMENT_ENTRIES,
  SHARED_ENTRIES,
} = require('./webpackEntryPoints');

const p = (...paths) => path.resolve(__dirname, ...paths);

const DEV_SERVER_PORT = 9000;

// webpack bundles apps/ unless a run opts into rspack.  Kept here, with
// a test on the default, because a one-token change to it silently
// swaps which bundler builds production assets.
const DEFAULT_BUNDLER = 'webpack';
const BUNDLERS = ['webpack', 'rspack'];

/**
 * Which bundler a run should use: the `--rspack` grunt flag wins, then
 * the APPS_BUNDLER environment variable, then the default.
 *
 * @param {Object} options
 * @param {boolean} options.rspackFlag - whether --rspack was passed
 * @param {Object} options.env - environment to read APPS_BUNDLER from
 * @returns {String} 'webpack' or 'rspack'; an unrecognized APPS_BUNDLER
 *   value falls back to the default, since building with the wrong
 *   bundler is worse than ignoring a typo
 */
function resolveBundler({rspackFlag = false, env = process.env} = {}) {
  if (rspackFlag) {
    return 'rspack';
  }
  if (env.APPS_BUNDLER && BUNDLERS.includes(env.APPS_BUNDLER)) {
    return env.APPS_BUNDLER;
  }
  return DEFAULT_BUNDLER;
}

// Certain packages ship in ES6 and need to be transpiled for our purposes.
const nodeModulesToTranspile = [
  // All of our @cdo- and @dsco_-aliased files should get transpiled as they are our own
  // source files.
  '@cdo',
  '@dsco_',
  // playground-io ships in ES6 as of 0.3.0
  'playground-io',
  'json-parse-better-errors',
  '@blockly/field-grid-dropdown',
  '@blockly/plugin-scroll-options',
  '@blockly/field-angle',
  '@blockly/field-bitmap',
  '@blockly/field-colour',
  'blockly',
  '@code-dot-org/dance-party',
  '@code-dot-org/johnny-five',
  '@code-dot-org/remark-plugins',
  'firmata',
  // parse5 ships in ES6: https://github.com/inikulin/parse5/issues/263#issuecomment-410745073
  'parse5',
  'vmsg',
  'ml-knn',
  'ml-array-max',
  'ml-array-min',
  'ml-array-rescale',
  'ml-distance-euclidean',
  '@codemirror',
  'style-mod',
  '@lezer',
  'microsoft-cognitiveservices-speech-sdk',
  'slate',
  'react-loading-skeleton',
  'unified',
].map(name => p('node_modules', name));

// As of Webpack 5, Node APIs are no longer automatically polyfilled.
// Each bundler wraps NODE_POLYFILL_PROVIDE in its ProvidePlugin to make
// the API available as a global, and spreads NODE_POLYFILL_FALLBACK
// into resolve.fallback to resolve the API to its npm package.
const NODE_POLYFILL_PROVIDE = {
  Buffer: ['buffer', 'Buffer'],
  events: 'events',
  stream: 'stream-browserify',
  path: 'path-browserify',
  process: 'process/browser',
  timers: 'timers-browserify',
};

const NODE_POLYFILL_FALLBACK = {
  buffer: require.resolve('buffer/'),
  events: require.resolve('events/'),
  path: require.resolve('path-browserify'),
  'process/browser': require.resolve('process/browser'),
  stream: require.resolve('stream-browserify'),
  timers: require.resolve('timers-browserify'),
  crypto: false,
  vm: require.resolve('vm-browserify'),
};

function devtool({minify} = {}) {
  if (process.env.CI) {
    return 'eval';
  } else if (minify) {
    return 'source-map';
  } else if (process.env.DEBUG_MINIFIED) {
    return 'eval-source-map';
  } else if (process.env.DEV) {
    return process.env.APPS_DEVTOOL || 'eval-cheap-module-source-map';
  } else {
    return 'inline-source-map';
  }
}

// alias '@cdo/aichat/locale' => 'src/aichat/locale-do-not-import.js'
const localeDoNotImport = (cdo, dir = 'src') => [
  cdo,
  p(cdo.replace(/^@cdo/, dir).replace(/locale$/, 'locale-do-not-import.js')),
];
// alias '@cdo/gamelab/locale' => 'src/p5lab/gamelab/locale-do-not-import.js'
// The p5lab labs keep their locale stubs one directory deeper.
const localeDoNotImportP5Lab = (cdo, dir = 'src') =>
  localeDoNotImport(cdo, `${dir}/p5lab`);

const APPLICATION_ALIASES = {
  '@cdo/apps': p('src'),
  '@cdo/static': p('static'),
  repl: p('src/noop'),
  '@cdo/storybook': p('.storybook'),
  '@cdoide': p('src/weblab2/CDOIDE'),
  '@cdo/generated-scripts': p('generated-scripts'),
  '@codebridge': p('src/codebridge'),
  // Prevent webpack from including linked npm dependencies' version of React
  // In other words, only bundle one copy of React (the one specified in this file)
  // and not the one specified by linked dependencies.
  react: p('node_modules/react'),
};

const LOCALE_ALIASES = {
  '@cdo/locale': p('src/util/locale-do-not-import.js'),
  ...Object.fromEntries([
    localeDoNotImport('@cdo/applab/locale'),
    localeDoNotImport('@cdo/codebridge/locale'),
    localeDoNotImport('@cdo/javalab/locale'),
    localeDoNotImport('@cdo/lab2/locale'),
    localeDoNotImport('@cdo/music/locale'),
    localeDoNotImport('@cdo/netsim/locale'),
    localeDoNotImport('@cdo/pythonlab/locale'),
    localeDoNotImport('@cdo/regionalPartnerMiniContact/locale'),
    localeDoNotImport('@cdo/regionalPartnerSearch/locale'),
    localeDoNotImport('@cdo/standaloneVideo/locale'),
    localeDoNotImport('@cdo/weblab/locale'),
    localeDoNotImport('@cdo/weblab2/locale'),
    localeDoNotImport('@cdo/signup/locale'),
    localeDoNotImportP5Lab('@cdo/gamelab/locale'),
    localeDoNotImportP5Lab('@cdo/poetry/locale'),
    localeDoNotImportP5Lab('@cdo/spritelab/locale'),
  ]),
};

// jQuery and qtip2 are provided globally by dashboard's application.js.
// qtip2 doesn't actually export anything - it's a jquery extension
// and modifies the jquery object when present.
// We also want to be free to import 'qtip2' in our code (for tests)
// without including a copy of it in our release bundles since it's
// already provided by application.js.
// Therefore we include it as an external here (which keeps us from
// including the library in release bundles) but we map it to the
// jquery object, which will always be available when we are depending
// on qtip.  Tests skip this 'external' configuration and load the
// npm-provided copy of qtip2.
const BUNDLE_EXTERNALS = [
  {
    jquery: 'var $',
    qtip2: 'var $',
  },
];

/**
 * Prepends the polyfills to each entry point, before its existing paths.
 *
 * @param {Object} entries - same shape as the bundler `entry` property
 * @param {String[]} polyfills - module requests to prepend
 * @returns {Object} a new entries object
 */
function addPolyfillsToEntryPoints(entries, polyfills) {
  return Object.fromEntries(
    Object.entries(entries).map(([entryName, paths]) => [
      entryName,
      [].concat(polyfills).concat(paths),
    ])
  );
}

/**
 * The cacheGroups that split shared modules out of our ~240 entry
 * points, hoisted: rspack calls the `chunks`/`test` callbacks from
 * rust once per module, and profiling showed per-call
 * Object.keys().includes() dominating whole production builds.  The
 * Set-based form is behavior-identical for webpack.
 *
 * Both configs skip splitChunks entirely in dev — it slows
 * rebuild+reload by 2x-10x (see PR #55707).
 *
 * @param {Object} appsEntries - the apps entry map in use for this build
 * @returns {Object} an optimization.splitChunks value
 */
function makeSplitChunks(appsEntries) {
  const appsEntryNames = new Set(Object.keys(appsEntries));
  const p5EntryNames = new Set(['spritelab', 'gamelab', 'dance']);
  const codeStudioNames = new Set(Object.keys(CODE_STUDIO_ENTRIES));
  const codeStudioAndApps = new Set([...codeStudioNames, ...appsEntryNames]);
  const vendorLibRegexes = [
    '@babel/polyfill/noConflict',
    '@mui',
    'immutable',
    'lodash',
    'moment',
    'radium',
    'react',
    'react-dom',
    'wgxpath',
  ].map(libName => new RegExp(`/apps/node_modules/${libName}/`));
  const vendorEntryNames = new Set([
    ...appsEntryNames,
    ...codeStudioNames,
    ...Object.keys(INTERNAL_ENTRIES),
    ...Object.keys(PROFESSIONAL_DEVELOPMENT_ENTRIES),
    ...Object.keys(SHARED_ENTRIES),
  ]);
  const studioRoutesPath = p('generated-scripts/studioRoutes.js');
  return {
    // Override the default limit of 3 concurrent downloads on page load,
    // which only makes sense for HTTP 1.1 servers. HTTP 2 performance has
    // been observed to degrade only with > 200 simultaneous downloads.
    maxInitialRequests: 100,
    cacheGroups: {
      // Pull any module shared by 2+ appsEntries into the "common" chunk.
      common: {
        name: 'common',
        minChunks: 2,
        chunks: chunk => appsEntryNames.has(chunk.name),
      },
      // Pull any module shared by 2+ CODE_STUDIO_ENTRIES into the
      // "code-studio-common" chunk.
      'code-studio-common': {
        name: 'code-studio-common',
        minChunks: 2,
        chunks: chunk => codeStudioNames.has(chunk.name),
        priority: 10,
      },
      // With just the cacheGroups listed above, we end up with many
      // duplicate modules between the "common" and "code-studio-common"
      // chunks. This cache group eliminates some of this duplication
      // by pulling more modules from "common" into "code-studio-common".
      //
      // The use of minChunks provides a guarantee that we don't
      // unnecessarily move things into "code-studio-common" which are
      // needed only by appsEntries. This avoids increasing the download
      // size for code studio pages which include code-studio-common.js
      // but not common.js.
      //
      // There is no converse guarantee that this strategy will eliminate
      // all duplication between "common" and "code-studio-common".
      // However, at the time of this writing, bundle analysis indicates
      // that is currently effective in eliminating any duplication.
      //
      // In the future, we want to move toward asynchronous imports, which
      // allow webpack to manage bundle splitting and sharing behind the
      // scenes. Once we adopt this approach, the need for predefined
      // cacheGroups will go away.
      //
      // For more information see: https://webpack.js.org/guides/code-splitting/
      'code-studio-multi': {
        name: 'code-studio-common',
        minChunks: appsEntryNames.size + 1,
        chunks: chunk => codeStudioAndApps.has(chunk.name),
        priority: 20,
      },
      vendors: {
        name: 'vendors',
        priority: 30,
        chunks: chunk => vendorEntryNames.has(chunk.name),
        test: module => vendorLibRegexes.some(r => r.test(module.resource)),
      },
      p5lab: {
        name: 'p5-dependencies',
        priority: 10,
        minChunks: 2,
        chunks: chunk => p5EntryNames.has(chunk.name),
        test: module => /p5/.test(module.resource),
      },
      // Keep the generated Rails routes out of the shared bundles.
      // This file is large and changes whenever the Rails routes change.
      studioRoutes: {
        name: 'studioRoutes',
        test: module => module.resource === studioRoutesPath,
        chunks: 'initial',
        enforce: true,
        priority: 40,
      },
    },
  };
}

/**
 * Canonical form of a cycle path list: drop the repeated endpoint,
 * rotate the lexicographically smallest module to the front, and
 * re-close the loop.  webpack's checker enumerates a cycle once per
 * member module (every rotation) while rspack's reports one arbitrary
 * rotation, so membership in the allowlist must not depend on where
 * the cycle string happens to start.
 *
 * @param {string[]} paths - module paths, first repeated as last
 * @returns {string} the canonical `a -> b -> a` form
 */
function canonicalCycle(paths) {
  const ring = paths.slice(0, -1);
  let start = 0;
  for (let i = 1; i < ring.length; i++) {
    if (ring[i] < ring[start]) {
      start = i;
    }
  }
  const rotated = ring.slice(start).concat(ring.slice(0, start));
  rotated.push(rotated[0]);
  return rotated.join(' -> ');
}

// circular_dependencies.json in canonical form, for rotation-insensitive
// membership checks.
const KNOWN_CYCLES = new Set(
  circularDependencies.map(entry => canonicalCycle(entry.split(' -> ')))
);

// Every module implicated in an allowlisted cycle.  Different detectors
// decompose the same strongly-connected tangle into different simple
// cycles, so exact matching is not enough: a cycle whose members are
// all already known-cyclic is the same debt in a different slicing,
// while a cycle touching any fresh module is genuinely new.
// TODO(rspack-default): this accepts a genuinely new cycle whose
// members all already cycle elsewhere.  Tighten to a real
// strongly-connected-component check before rspack becomes the
// default bundler.
const KNOWN_CYCLIC_MODULES = new Set(
  circularDependencies.flatMap(entry => entry.split(' -> '))
);

/**
 * Whether a detected cycle is covered by circular_dependencies.json,
 * regardless of which rotation or decomposition the detector chose.
 *
 * @param {string[]} paths - module paths, first repeated as last
 * @returns {boolean}
 */
function isKnownCycle(paths) {
  return (
    KNOWN_CYCLES.has(canonicalCycle(paths)) ||
    paths.every(m => KNOWN_CYCLIC_MODULES.has(m))
  );
}

module.exports = {
  DEV_SERVER_PORT,
  DEFAULT_BUNDLER,
  BUNDLERS,
  resolveBundler,
  nodeModulesToTranspile,
  NODE_POLYFILL_PROVIDE,
  NODE_POLYFILL_FALLBACK,
  devtool,
  localeDoNotImport,
  localeDoNotImportP5Lab,
  APPLICATION_ALIASES,
  LOCALE_ALIASES,
  BUNDLE_EXTERNALS,
  addPolyfillsToEntryPoints,
  makeSplitChunks,
  canonicalCycle,
  isKnownCycle,
};
