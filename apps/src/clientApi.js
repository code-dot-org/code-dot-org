// TODO: The client API should be instantiated with the channel ID, instead of grabbing it from the `dashboard.project` global.
import queryString from 'query-string';

/*global dashboard*/

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

  withProjectId(projectId) {
    var boundApi = new this.constructor(this.collectionType);
    boundApi.projectId = projectId;
    return boundApi;
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
    if (!window.dashboard && !this.projectId) {
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

  deleteFile(filename, success, error) {
    return ajaxInternal('DELETE', this.basePath(filename), success, error);
  }

  getUploadUrl() {
    return this.basePath('/');
  }

  makeUploadDoneCallback(callback) {
    return callback;
  }
}

class FilesApi extends CollectionsApi {
  getVersionHistory(success, error) {
    var path = apiPath(
      'files-version',
      this.projectId || window.dashboard.project.getCurrentId()
    );
    return ajaxInternal('GET', path, success, error);
  }

  restorePreviousVersion(versionId, success, error) {
    var path = apiPath(
      'files-version',
      this.projectId || window.dashboard.project.getCurrentId()
    );
    path += '?' + queryString.stringify({
      version: versionId
    });
    return ajaxInternal('PUT', path, success, error);
  }

  renameFile(oldFilename, newFilename, success, error) {
    var path = this.basePath(newFilename);
    var params = {
      src: oldFilename,
      delete: oldFilename
    };
    if (dashboard.project.filesVersionId) {
      params['files-version'] = dashboard.project.filesVersionId;
    }
    path += '?' + queryString.stringify(params);
    return ajaxInternal('PUT', path, xhr => {
        var response = JSON.parse(xhr.response);
        dashboard.project.filesVersionId = response.filesVersionId;
        if (success) {
          success(xhr, dashboard.project.filesVersionId);
        }
      },
      error);
  }

  basePathWithFilesVersion(filename) {
    var path = this.basePath(filename);
    if (dashboard.project.filesVersionId) {
      path += `?files-version=${dashboard.project.filesVersionId}`;
    }
    return path;
  }

  deleteFile(filename, success, error) {
    return ajaxInternal('DELETE', this.basePathWithFilesVersion(filename), xhr => {
        var response = JSON.parse(xhr.response);
        dashboard.project.filesVersionId = response.filesVersionId;
        if (success) {
          success(xhr, dashboard.project.filesVersionId);
        }
      },
      error);
  }

  getUploadUrl() {
    return this.basePathWithFilesVersion('/');
  }

  makeUploadDoneCallback(callback) {
    return result => {
      dashboard.project.filesVersionId = result.filesVersionId;
      if (callback) {
        callback(result);
      }
    };
  }
}
module.exports = {
  animations: new CollectionsApi('animations'),
  assets: new AssetsApi('assets'),
  files: new FilesApi('files'),
  sources: new CollectionsApi('sources'),
  channels: new CollectionsApi('channels'),
};
