var assets = [];

module.exports = {
  reset: function (list) {
    assets = list.slice();
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

  list: function (typeFilter) {
    return typeFilter ? assets.filter(function (asset) {
      return asset.category === typeFilter;
    }) : assets.slice();
  }
};
