import queryString from 'query-string';

module.exports = {
  /**
   * Gets the URL querystring params.
   * @param name {string=} Optionally pull a specific param.
   * @return {object|string} Hash of params, or param string if `name` is specified.
   */
  queryParams(name) {
    const parsed = queryString.parse(window.location.search);
    if (name) {
      return parsed[name];
    }
    return parsed;
  },

  /**
   * Updates a query parameter in the URL via pushState (i.e. doesn't force a
   * reload).
   */
  updateQueryParam(param, value) {
    const newString = queryString.stringify({
      ...queryString.parse(location.search),
      [param]: value
    });

    let newLocation = window.location.pathname;
    // Don't append ? unless we actually have a value
    if (newString) {
      newLocation += '?' + newString;
    }
    window.history.pushState(null, document.title, newLocation);
  }
};
