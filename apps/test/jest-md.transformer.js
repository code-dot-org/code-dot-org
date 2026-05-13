/**
 * Jest transformer for .md files.
 * Returns the raw markdown content as a module export,
 * mirroring webpack's `asset/source` behavior.
 */
module.exports = {
  process(src) {
    return {
      code: `module.exports = ${JSON.stringify(src)};`,
    };
  },
};
