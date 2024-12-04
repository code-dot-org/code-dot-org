const glob = require('glob');
const {basename, dirname} = require('path');

const entryPoints = glob.sync('./src/**/index.ts', {
  posix: true,
  nodir: true,
});

const componentExports = {};

for (const entryPoint of entryPoints) {
  const componentName = basename(dirname(entryPoint));

  componentExports[`./${componentName}`] = {
    types: `./dist/${componentName}/index.d.ts`,
    import: `./dist/${componentName}/index.mjs`,
    require: `./dist/${componentName}/index.js`,
  };

  componentExports[`./${componentName}/index.css`] =
    `./dist/${componentName}/index.css`;
}

module.exports = {
  remove: ['devDependencies'],
  replace: {
    main: 'dist/index.js',
    module: 'dist/index.mjs',
    types: 'dist/index.d.ts',
    exports: {
      './package.json': './package.json',
      ...componentExports,
    },
  },
};
