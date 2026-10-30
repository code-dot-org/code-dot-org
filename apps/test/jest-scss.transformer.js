const scssTransformer = require('jest-scss-transform');

module.exports = {
  process(src, filename, config, options) {
    const transformed = scssTransformer.process(src, filename);

    // For SCSS files that do not have any constants, proxy their key for consistent class names
    // See identity-obj-proxy for more details
    if (transformed.code === 'module.exports = {};') {
      return {
        code: `module.exports = require('identity-obj-proxy')`,
      };
    }

    return transformed;
  },
};
