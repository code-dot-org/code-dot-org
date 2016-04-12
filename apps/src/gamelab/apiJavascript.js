var GameLab;

// API definitions for functions exposed for JavaScript (droplet/ace) levels:
exports.injectGameLab = function (gamelab) {
  GameLab = gamelab;
};

exports.playSound = function (url) {
  return GameLab.executeCmd(null,
      'playSound',
      {'url': url});
};

exports.foo = function () {
  GameLab.executeCmd(null, 'foo');
};
