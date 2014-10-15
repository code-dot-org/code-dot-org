
exports.random = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

exports.turnBlack = function (id) {
  Webapp.executeCmd(id, 'turnBlack');
};
