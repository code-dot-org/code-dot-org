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

  makeUploadStartCallback(callback) {
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

  _renameFileInternal(oldFilename, newFilename, success, error) {
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

  renameFile(oldFilename, newFilename, success, error) {
    if (this._beforeWriteHook) {
      this._beforeWriteHook(err => {
        // continuing regardless of error status from hook...
        this._renameFileInternal(oldFilename, newFilename, success, error);
      });
      this._beforeWriteHook = null;
    } else {
      this._renameFileInternal(oldFilename, newFilename, success, error);
    }
  }

  basePathWithFilesVersion(filename) {
    var path = this.basePath(filename);
    if (dashboard.project.filesVersionId) {
      path += `?files-version=${dashboard.project.filesVersionId}`;
    }
    return path;
  }

  _deleteFileInternal(filename, success, error) {
    return ajaxInternal('DELETE', this.basePathWithFilesVersion(filename), xhr => {
        var response = JSON.parse(xhr.response);
        dashboard.project.filesVersionId = response.filesVersionId;
        if (success) {
          success(xhr, dashboard.project.filesVersionId);
        }
      },
      error);
  }

  deleteFile(filename, success, error) {
    if (this._beforeWriteHook) {
      this._beforeWriteHook(err => {
        // continuing regardless of error status from hook...
        this._deleteFileInternal(filename, success, error);
      });
      this._beforeWriteHook = null;
    } else {
      this._deleteFileInternal(filename, success, error);
    }
  }

  _putFileInternal(filename, fileData, success, error) {
    return ajaxInternal('PUT', this.basePathWithFilesVersion(filename), xhr => {
        var response = JSON.parse(xhr.response);
        dashboard.project.filesVersionId = response.filesVersionId;
        if (success) {
          success(xhr, dashboard.project.filesVersionId);
        }
      },
      error,
      fileData);
  }

  putFile(filename, fileData, success, error) {
    if (this._beforeWriteHook) {
      this._beforeWriteHook(err => {
        // continuing regardless of error status from hook...
        this._putFileInternal(filename, fileData, success, error);
      });
      this._beforeWriteHook = null;
    } else {
      this._putFileInternal(filename, fileData, success, error);
    }
  }

  deleteAll(success, error) {
    // Note: just reset the beforeWriteHook, but don't call it
    // since we're deleting everything:
    this._beforeWriteHook = null;
    return ajaxInternal('DELETE', this.basePathWithFilesVersion('*'), xhr => {
        var response = JSON.parse(xhr.response);
        dashboard.project.filesVersionId = response.filesVersionId;
        if (success) {
          success(xhr, dashboard.project.filesVersionId);
        }
      },
      error);
  }

  registerBeforeWriteHook(hook) {
    this._beforeWriteHook = hook;
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

  makeUploadStartCallback(callback) {
    return data => {
      if (this._beforeWriteHook) {
        this._beforeWriteHook(err => {
          // continuing regardless of error status from hook...
          callback(data);
        });
        this._beforeWriteHook = null;
      } else {
        callback(data);
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
