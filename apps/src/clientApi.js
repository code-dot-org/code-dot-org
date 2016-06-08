// TODO: The client API should be instantiated with the channel ID, instead of grabbing it from the `dashboard.project` global.
import queryString from 'query-string';

function apiPath(endpoint, channelId, path) {
  var base = `/v3/${endpoint}/${channelId}`;
  if (path) {
    base += `/${path}`;
  }
  return base;
}

function ajaxInternal(method, path, success, error, data) {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', function () {
    if (xhr.status >= 400) {
      error && error(xhr);
      return;
    }
    success(xhr);
  });
  xhr.addEventListener('error', function () {
    error && error(xhr);
  });

  xhr.open(method, path, true);
  xhr.send(data);
}


class CollectionsApi {
  constructor(collectionType) {
    this.collectionType = collectionType;
  }

  setProjectId(projectId) {
    this.projectId = projectId;
    return this;
  }

  basePath(path) {
    return apiPath(
      this.collectionType,
      this.projectId || window.dashboard.project.getCurrentId(),
      path
    );
  }

  ajax(method, file, success, error, data) {
    error = error || function () {};
    if (!window.dashboard) {
      error({status: "No dashboard"});
      return;
    }
    return ajaxInternal(method, this.basePath(file), success, error, data);
  }
}

class AssetsApi extends CollectionsApi {
  copyAssets(sourceProjectId, assetFilenames, success, error) {
    var path = apiPath(
      'copy-assets',
      this.projectId || window.dashboard.project.getCurrentId()
    );
    path += '?' + queryString.stringify({
      src_channel: sourceProjectId,
      src_files: JSON.stringify(assetFilenames)
    });
    return ajaxInternal('POST', path, success, error);
  }
}

module.exports = {
  animations: new CollectionsApi('animations'),
  assets: new AssetsApi('assets'),
  sources: new CollectionsApi('sources')
};
