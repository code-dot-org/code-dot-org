const loader = require('../lib/ejs-webpack-loader');

module.exports = {
  process(src, filename, config, options) {
    const result = loader.call(
      {
        loaders: [],
        resourcePath: filename,
        options: {
          'ejs-compiled-loader': {
            strict: true,
          },
        },
      },
      src
    );

    return {
      code: result,
    };
  },
};
