import clientApi from '@cdo/apps/code-studio/initApp/clientApi';

const REQUEST_RETRY_COUNT = 1;

export default class BackpackClientApi {
  constructor(channelId) {
    this.backpackApi = clientApi.create('/v3/libraries');
    this.channelId = channelId;
    this.uploadingFiles = false;
    this.fileUploadsInProgress = [];
    this.fileUploadsFailed = [];
    this.fileDeletesInProgress = [];
    this.fileDeletesFailed = [];
  }

  hasBackpack() {
    return !!this.channelId;
  }

  fetchChannelId(callback) {
    $.ajax({
      url: '/backpacks/channel',
      type: 'get',
    }).done(response => {
      this.channelId = response.channel;
      callback();
    });
  }

  fetchFile(filename, onError, onSuccess) {
    if (!this.hasBackpack()) {
      onError();
    }
    this.backpackApi.fetch(
      this.channelId + '/' + filename,
      (error, data) => {
        if (error) {
          onError();
        } else {
          onSuccess(data);
        }
      },
      'text'
    );
  }

  getFileList(onError, onSuccess) {
    if (!this.hasBackpack()) {
      onError();
    }
    this.backpackApi.fetch(this.channelId, (error, data) => {
      if (error) {
        onError(error);
      } else {
        const filenames = [];
        data.forEach(fileData => filenames.push(fileData['filename']));
        onSuccess(filenames);
      }
    });
  }

  /**
   * Save files to the backpack
   * @param {String} filesJson json-formatted string of all file sources in the project
   * Expected format is {"filename1.java": {"text": "{...}"},...}.
   * @param {Array} filenames Array of filenames to save to the backpack. Filenames must
   * exist in filesJson.
   * @param {Function} onError Function to call if any file fails to save
   * @param {Function} onSuccess Function to call if all files save.
   */
  saveFiles(filesJson, filenames, onError, onSuccess) {
    this.updateFilesHelper(
      this.fileUploadsInProgress,
      filenames,
      onError,
      onSuccess,
      () => this.saveFilesHelper(filesJson, filenames, onError, onSuccess)
    );
  }

  /**
   * Delete files from the backpack
   * @param {Array} filenames Array of filenames to delete from the backpack.
   * @param {Function} onError Function to call if any file fails to delete
   * @param {Function} onSuccess Function to call if all files are deleted.
   */

  deleteFiles(filenames, onError, onSuccess) {
    this.updateFilesHelper(
      this.fileDeletesInProgress,
      filenames,
      onError,
      onSuccess,
      () => this.deleteFilesHelper(filenames, onError, onSuccess)
    );
  }

  /**
   * Check that there are no file updates in progress and that the list of files to update
   * is not empty. Then, if we do not already have the channel id for this backpack fetch it.
   * Finally, call the given callback.
   * @param {Array} filesInProgress list of file updates in progress, or an empty list
   * @param {Array} filenames List of files to update.
   * @param {Function} onError error callback
   * @param {Function} onSuccess success callback, only called if there is nothing to update
   * @param {Function} callback callback function to continue updating files
   */
  updateFilesHelper(filesInProgress, filenames, onError, onSuccess, callback) {
    if (filesInProgress.length > 0) {
      // If an update is currently in progress (a previous update has not gone through its
      // entire list of files to resolve), return an error. Frontend should prevent multiple
      // button clicks in a row.
      onError();
      return;
    }
    if (filenames.length === 0) {
      // nothing to update
      onSuccess();
      return;
    }
    // only fetch channel id if we don't yet have it
    if (!this.channelId) {
      this.fetchChannelId(() => callback());
    } else {
      callback();
    }
  }

  saveFilesHelper(filesJson, filenames, onError, onSuccess) {
    this.fileUploadsInProgress = [...filenames];
    this.fileUploadsFailed = [];
    filenames.forEach(filename => {
      const fileContents = filesJson[filename].text;
      // write file with REQUEST_RETRY_COUNT failure retries
      this.writeSingleFileToBackpack(
        filename,
        fileContents,
        onError,
        onSuccess,
        REQUEST_RETRY_COUNT
      );
    });
  }

  writeSingleFileToBackpack(
    filename,
    fileContents,
    onError,
    onSuccess,
    retryCount
  ) {
    this.backpackApi.put(this.channelId, fileContents, filename, (error, _) => {
      if (error) {
        if (retryCount > 0) {
          this.writeSingleFileToBackpack(
            filename,
            fileContents,
            onError,
            onSuccess,
            retryCount - 1
          );
        } else {
          // record failure and check if all files are done attempting upload/uploading
          this.fileUploadsFailed.push(filename);
          this.onRequestComplete(
            filename,
            this.fileUploadsInProgress,
            this.fileUploadsFailed,
            onError,
            onSuccess,
            error
          );
        }
      } else {
        this.onRequestComplete(
          filename,
          this.fileUploadsInProgress,
          this.fileUploadsFailed,
          onError,
          onSuccess
        );
      }
    });
  }

  deleteFilesHelper(filenames, onError, onSuccess) {
    this.fileDeletesInProgress = [...filenames];
    this.fileDeletesFailed = [];
    filenames.forEach(filename => {
      // delete file with REQUEST_RETRY_COUNT failure retries
      this.deleteSingleFileFromBackpack(
        filename,
        onError,
        onSuccess,
        REQUEST_RETRY_COUNT
      );
    });
  }

  deleteSingleFileFromBackpack(filename, onError, onSuccess, retryCount) {
    this.backpackApi.deleteObject(
      this.channelId + '/' + filename,
      (error, _) => {
        if (error) {
          if (retryCount > 0) {
            this.deleteSingleFileFromBackpack(
              filename,
              onError,
              onSuccess,
              retryCount - 1
            );
          } else {
            // record failure and check if all files are done attempting delete
            this.fileDeletesFailed.push(filename);
            this.onRequestComplete(
              filename,
              this.fileDeletesInProgress,
              this.fileDeletesFailed,
              onError,
              onSuccess,
              error
            );
          }
        } else {
          this.onRequestComplete(
            filename,
            this.fileDeletesInProgress,
            this.fileDeletesFailed,
            onError,
            onSuccess
          );
        }
      }
    );
  }

  // Mark the given file as done updating/attempting to update.
  // Check if all files are done updating. If they are, call either onSuccess
  // or onError depending on if we saw any errors.
  onRequestComplete(
    filename,
    filesInRequest,
    failedFileList,
    onError,
    onSuccess,
    error
  ) {
    const filenameIndex = filesInRequest.indexOf(filename);
    if (filenameIndex >= 0) {
      filesInRequest.splice(filenameIndex, 1);
    }
    if (filesInRequest.length === 0 && failedFileList.length === 0) {
      onSuccess();
    } else if (filesInRequest.length === 0) {
      onError(error, failedFileList);
    }
  }
}
