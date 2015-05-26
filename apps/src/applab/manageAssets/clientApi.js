module.exports = {
  basePath: function (path) {
    return '/v3/assets/' + dashboard.project.current.id + (path ? '/' + path : '');
  },
  ajax: function (method, file, success, error, data) {
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
