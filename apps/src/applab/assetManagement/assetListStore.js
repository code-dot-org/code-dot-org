var assets = [];

module.exports = {
  reset: function (list) {
    assets = list;
    return assets;
  },

  add: function (asset) {
    assets.push(asset);
    return assets;
  },

  remove: function (filename) {
    assets = assets.filter(function (asset) {
      return asset.filename !== filename;
    });
    return assets;
  },

  list: function (typeFilter) {
    return typeFilter ? assets.filter(function (asset) {
      return asset.category === typeFilter;
    }) : assets;
  }
};
