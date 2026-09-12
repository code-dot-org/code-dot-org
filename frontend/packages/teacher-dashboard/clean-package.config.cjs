module.exports = {
  remove: ['devDependencies'],
  replace: {
    main: 'dist/index.js',
    module: 'dist/index.mjs',
    types: 'dist/index.d.ts',
    exports: {
      './package.json': './package.json',
    },
  },
};
