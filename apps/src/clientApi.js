/* global dashboard */
// TODO(dave): Merge with the client API in /shared.
// TODO: The client API should be instantiated with the channel ID, instead of grabbing it from the `dashboard.project` global.

module.exports = {
  animations: clientApi('animations'),
  assets: clientApi('assets'),
  sources: clientApi('sources')
};

function clientApi(endpoint) {
  return {
    basePath: function (path) {
      return '/v3/' + endpoint + '/' + dashboard.project.getCurrentId() + (path ? '/' + path : '');
    },
    ajax: function (method, file, success, error, data) {
      error = error || function () {};
      if (!window.dashboard) {
        error({status: "No dashboard"});
        return;
      }
      var xhr = new XMLHttpRequest();
      xhr.addEventListener('load', function () {
        if (xhr.status >= 400) {
          error(xhr);
          return;
        }
        success(xhr);
      });
      xhr.addEventListener('error', function () {
        error(xhr);
      });

      xhr.open(method, this.basePath(file), true);
      xhr.send(data);
    }
  };
}
