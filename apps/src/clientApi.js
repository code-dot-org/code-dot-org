// TODO: The client API should be instantiated with the channel ID, instead of grabbing it from the `dashboard.project` global.
import queryString from 'query-string';

function project() {
  return require('./code-studio/initApp/project');
}

function apiPath(endpoint, channelId, path) {
  var base = `/v3/${endpoint}/${channelId}`;
  if (path) {
    base += `/${path}`;
  }
  return base;
}

function ajaxInternal(method, path, success, error, data) {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', function() {
    if (xhr.status >= 400) {
      error && error(xhr);
      return;
    }
    success(xhr);
  });
  xhr.addEventListener('error', function() {
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

  getProjectId() {
    return this.projectId || project().getCurrentId();
  }

  // NOTE: path parameter as supplied should not be URI encoded, as it will be
  // URI encoded in this function...
  basePath(path) {
    var encodedPath;
    if (path) {
      // encode all characters except forward slashes
      encodedPath = encodeURIComponent(path).replace(/%2F/g, '/');
    }
    return apiPath(this.collectionType, this.getProjectId(), encodedPath);
  }

  ajax(method, file, success, error, data) {
    error = error || function() {};
    if (!window.dashboard && !this.getProjectId()) {
      error({status: 'No dashboard'});
      return;
    }
    return ajaxInternal(method, this.basePath(file), success, error, data);
  }

  getFile(file, version, success, error, data) {
    error = error || function() {};
    if (!window.dashboard && !this.getProjectId()) {
      error({status: 'No dashboard'});
      return;
    }
    let url = this.basePath(file);
    if (version) {
      url = `${url}?version=${version}`;
    }
    return ajaxInternal('GET', url, success, error);
  }

  /*
   * Restore this file to the state of a previous version
   * @param file {String} name of file
   * @param versionId {String} identifier of previous version
   * @param success {Function} callback when successful (includes xhr parameter)
   * @param error {Function} callback when failed (includes xhr parameter)
   */
  restorePreviousFileVersion(file, versionId, success, error) {
    var path = this.basePath(`${file}/restore`);
    path +=
      '?' +
      queryString.stringify({
        version: versionId
      });
    return ajaxInternal('PUT', path, success, error);
  }

  _withBeforeFirstWriteHook(fn) {
    if (this._beforeFirstWriteHook) {
      this._beforeFirstWriteHook(err => {
        // continuing regardless of error status from hook...
        fn();
      });
      this._beforeFirstWriteHook = null;
    } else {
      fn();
    }
  }

  /*
   * Register a hook that will be called before the first write to the project
   * using the files API. (This allows the starting project data to be written
   * on a deferred basis, thereby preventing writes to user projects with
   * default starting data)
   */
  registerBeforeFirstWriteHook(hook) {
    this._beforeFirstWriteHook = hook;
  }
}

class AssetsApi extends CollectionsApi {
  copyAssets(sourceProjectId, assetFilenames, success, error) {
    var path = apiPath('copy-assets', this.getProjectId());
    path +=
      '?' +
      queryString.stringify({
        src_channel: sourceProjectId,
        src_files: JSON.stringify(assetFilenames)
      });
    return ajaxInternal('POST', path, success, error);
  }

  /*
   * Delete a file
   * @param filename {String} file name to be deleted
   * @param success {Function} callback when successful (includes xhr parameter)
   * @param error {Function} callback when failed (includes xhr parameter)
   */
  deleteFile(filename, success, error) {
    return ajaxInternal('DELETE', this.basePath(filename), success, error);
  }

  /*
   * Retrieve URL to be used for uploading files
   */
  getUploadUrl() {
    return this.basePath('/');
  }

  /*
   * Wrap uploadDone callback (for use with jquery fileupload)
   */
  wrapUploadDoneCallback(callback) {
    return callback;
  }

  /*
   * Wrap uploadStart callback (for use with jquery fileupload)
   */
  wrapUploadStartCallback(callback) {
    return callback;
  }

  /**
   * Callback used by getFiles.
   * @callback getFiles~success
   * @param {Object} result
   * @param {string[]} [result.files] List of filenames
   * @param {string} [result.filesVersionId] Project version (when applicable)
   * @param {XMLHttpRequest} xhr
   */

  /*
   * Get a list of all files
   * @callback success {getFiles~success} callback when successful
   * @callback error {Function} callback when failed (includes xhr parameter)
   * @param version {string} Ignored for this API, but matches other getFiles()
   */
  getFiles(success, error, version) {
    return ajaxInternal(
      'GET',
      this.basePath(''),
      xhr => {
        var parsedResponse;
        try {
          parsedResponse = JSON.parse(xhr.responseText);
        } catch (e) {
          if (error) {
            error(xhr);
            return;
          }
        }
        if (success) {
          success({files: parsedResponse}, xhr);
        }
      },
      error
    );
  }

  /*
   * Create or update an asset
   * @param filename {String} filename to be created or updated
   * @param data {Blob} asset data
   * @param success {Function} callback when successful (includes xhr parameter)
   * @param error {Function} callback when failed
   */
  putAsset(filename, data, success = () => {}, error = () => {}) {
    this._withBeforeFirstWriteHook(() => {
      ajaxInternal('PUT', this.basePath(filename), success, error, data);
    });
  }
}

class FilesApi extends CollectionsApi {
  /*
   * Get the version history for this project
   * @param success {Function} callback when successful (includes xhr parameter)
   * @param error {Function} callback when failed (includes xhr parameter)
   */
  getVersionHistory(success, error) {
    var path = apiPath('files-version', this.getProjectId());
    return ajaxInternal('GET', path, success, error);
  }

  /*
   * Restore this project to the state of a previous version
   * @param versionId {String} identifier of previous version
   * @param success {Function} callback when successful (includes xhr parameter)
   * @param error {Function} callback when failed (includes xhr parameter)
   */
  restorePreviousVersion(versionId, success, error) {
    var path = apiPath('files-version', this.getProjectId());
    path +=
      '?' +
      queryString.stringify({
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
    if (project().filesVersionId) {
      params['files-version'] = project().filesVersionId;
    }
    path += '?' + queryString.stringify(params);
    return ajaxInternal(
      'PUT',
      path,
      xhr => {
        var response = JSON.parse(xhr.response);
        project().filesVersionId = response.filesVersionId;
        if (success) {
          success(xhr, project().filesVersionId);
        }
      },
      error
    );
  }

  /*
   * Rename a file
   * @param oldFilename {String} file name before rename
   * @param newFilename {String} file name after rename
   * @param success {Function} callback when successful (includes xhr parameter)
   * @param error {Function} callback when failed (includes xhr parameter)
   */
  renameFile(oldFilename, newFilename, success, error) {
    this._withBeforeFirstWriteHook(() => {
      this._renameFileInternal(oldFilename, newFilename, success, error);
    });
  }

  /*
   * Prepare for remix (ensures we have always completed first write before remix)
   * @param completion {Function} callback when done
   */
  prepareForRemix(callback) {
    this._withBeforeFirstWriteHook(callback);
  }

  basePathWithFilesVersion(filename) {
    var path = this.basePath(filename);
    if (project().filesVersionId) {
      path += `?files-version=${project().filesVersionId}`;
    }
    return path;
  }

  _deleteFileInternal(filename, success, error) {
    return ajaxInternal(
      'DELETE',
      this.basePathWithFilesVersion(filename),
      xhr => {
        var response = JSON.parse(xhr.response);
        project().filesVersionId = response.filesVersionId;
        if (success) {
          success(xhr, project().filesVersionId);
        }
      },
      error
    );
  }

  /*
   * Delete a file
   * @param filename {String} file name to be deleted
   * @param success {Function} callback when successful (includes xhr parameter)
   * @param error {Function} callback when failed (includes xhr parameter)
   */
  deleteFile(filename, success, error) {
    this._withBeforeFirstWriteHook(() => {
      this._deleteFileInternal(filename, success, error);
    });
  }

  _putFileInternal(filename, fileData, success, error) {
    return ajaxInternal(
      'PUT',
      this.basePathWithFilesVersion(filename),
      xhr => {
        var response = JSON.parse(xhr.response);
        project().filesVersionId = response.filesVersionId;
        if (success) {
          success(xhr, project().filesVersionId);
        }
      },
      error,
      fileData
    );
  }

  /*
   * Create or update a file
   * @param filename {String} file name to be created or updated
   * @param fileData {Blob} file data
   * @param success {Function} callback when successful (includes xhr parameter)
   * @param error {Function} callback when failed (includes xhr parameter)
   */
  putFile(filename, fileData, success, error) {
    this._withBeforeFirstWriteHook(() => {
      this._putFileInternal(filename, fileData, success, error);
    });
  }

  /*
   * Delete all files in project
   * @param success {Function} callback when successful (includes xhr parameter)
   * @param error {Function} callback when failed (includes xhr parameter)
   */
  deleteAll(success, error) {
    // Note: just reset the _beforeFirstWriteHook, but don't call it
    // since we're deleting everything:
    this._beforeFirstWriteHook = null;
    return ajaxInternal('DELETE', this.basePath('*'), success, error);
  }

  /*
   * Retrieve URL to be used for uploading files
   */
  getUploadUrl() {
    return this.basePathWithFilesVersion('/');
  }

  /*
   * Wrap uploadDone callback (for use with jquery fileupload)
   */
  wrapUploadDoneCallback(callback) {
    return result => {
      project().filesVersionId = result.filesVersionId;
      if (callback) {
        callback(result);
      }
    };
  }

  /*
   * Wrap uploadStart callback (for use with jquery fileupload)
   */
  wrapUploadStartCallback(callback) {
    return data => {
      this._withBeforeFirstWriteHook(() => {
        callback(data);
      });
    };
  }

  /*
   * Get a list of all files
   * @callback success {getFiles~success} callback when successful
   * @callback error {Function} callback when failed (includes xhr parameter)
   * @param version {string} Optional filesVersionId for project
   */
  getFiles(success, error, version) {
    let path = this.basePath('');
    if (version) {
      path = path + `?version=${version}`;
    }
    return ajaxInternal(
      'GET',
      path,
      xhr => {
        var parsedResponse;
        try {
          parsedResponse = JSON.parse(xhr.responseText);
        } catch (e) {
          if (error) {
            error(xhr);
            return;
          }
        }
        if (success) {
          success(parsedResponse, xhr);
        }
      },
      error
    );
  }
}

class StarterAssetsApi {
  getStarterAssets(levelName, onSuccess, onFailure) {
    return ajaxInternal(
      'GET',
      this.withLevelName(levelName).basePath(''),
      onSuccess,
      onFailure
    );
  }

  withLevelName(levelName) {
    var boundApi = new this.constructor();
    boundApi.levelName = levelName;
    return boundApi;
  }

  basePath(path) {
    if (!this || !this.levelName) {
      const error =
        'You must bind the API and set levelName before creating a base path.';
      throw new Error(error);
    }

    return `/level_starter_assets/${this.levelName}/${path}`;
  }

  getUploadUrl() {
    return this.basePath('');
  }

  wrapUploadDoneCallback(callback) {
    return callback;
  }

  wrapUploadStartCallback(callback) {
    return callback;
  }

  deleteFile(filename, success, error) {
    return ajaxInternal('DELETE', this.basePath(filename), success, error);
  }
}

module.exports = {
  animations: new CollectionsApi('animations'),
  assets: new AssetsApi('assets'),
  starterAssets: new StarterAssetsApi(),
  files: new FilesApi('files'),
  sources: new CollectionsApi('sources'),
  channels: new CollectionsApi('channels')
};
