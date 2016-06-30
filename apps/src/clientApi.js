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

  basePath(path) {
    return apiPath(this.collectionType, window.dashboard.project.getCurrentId(), path);
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
  constructor(collectionType) {
    super(collectionType);
    // TODO: hack to deal with the fact that IE10 doesn't seem to handle inheritance
    // well - i.e. we're just redoing the work of our parent ctor here. remove
    // AssetsApi ctor once we've cut IE10
    this.collectionType = collectionType;
  }

  copyAssets(sourceProjectId, assetFilenames, success, error) {
    var path = apiPath('copy-assets', window.dashboard.project.getCurrentId());
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
