'use strict';

module.exports = {
  /**
   * Gets the URL querystring params.
   * @param name {string=} Optionally pull a specific param.
   * @return {object|string} Hash of params, or param string if `name` is specified.
   */
  queryParams: function (name) {
    var pairs = location.search.substr(1).split('&');
    var params = {};
    pairs.forEach(function (pair) {
      var split = pair.split('=');
      if (split.length === 2) {
        params[split[0]] = split[1];
      }
    });

    if (name) {
      return params[name];
    }
    return params;
  }
};
