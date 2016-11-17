var GameLab;

// API definitions for functions exposed for JavaScript (droplet/ace) levels.
// The p5/p5play API is injected separately.

exports.injectGameLab = function (gamelab) {
  GameLab = gamelab;
};

exports.playSound = function (url) {
  return GameLab.executeCmd(null,
      'playSound',
      {'url': url});
};

/**
 * Stop playing sounds.
 * @param {string} [url] - optional.  If omitted, stops all sounds.
 */
exports.stopSound = function (url) {
  return GameLab.executeCmd(null,
      'stopSound',
      {'url': url});
};
