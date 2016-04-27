var assets = [];

module.exports = {
  reset: function (list) {
    return assets = list.slice();
  },

  add: function (asset) {
    assets.push(asset);
    return assets.slice();
  },

  remove: function (filename) {
    assets = assets.filter(function (asset) {
      return asset.filename !== filename;
    });
    return assets.slice();
  },

  list: function (allowedExtensions) {
    return allowedExtensions ? assets.filter(function (asset) {
      var match = asset.filename.match(/\.[^.]+$/);
      if (match) {
        var extension = match[0];
        return allowedExtensions.split(', ').indexOf(extension) > -1;
      }
    }) : assets.slice();
  }
};
