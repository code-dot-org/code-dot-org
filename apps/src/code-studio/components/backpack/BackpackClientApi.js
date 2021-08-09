import clientApi from '@cdo/apps/code-studio/initApp/clientApi';

const SAVE_RETRY_COUNT = 1;

export default class BackpackClientApi {
  constructor(channelId) {
    this.backpackApi = clientApi.create('/v3/libraries');
    this.channelId = channelId;
    this.uploadingFiles = false;
    this.filesToUpload = [];
    this.fileUploadsFailed = [];
  }

  hasBackpack() {
    return !!this.channelId;
  }

  fetchChannelId(callback) {
    $.ajax({
      url: '/backpacks/channel',
      type: 'get'
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
          onError(error);
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
    if (this.filesToUpload.length > 0) {
      // save is currently in progress (a previous saveFilesHelper has not gone through its
      // entire list of files to upload), return an error. Frontend should prevent multiple
      // button clicks in a row.
      onError();
      return;
    }
    if (filenames.length === 0) {
      // nothing to save
      onSuccess();
      return;
    }
    // only fetch channel id if we don't yet have it
    if (!this.channelId) {
      this.fetchChannelId(() =>
        this.saveFilesHelper(filesJson, filenames, onError, onSuccess)
      );
    } else {
      this.saveFilesHelper(filesJson, filenames, onError, onSuccess);
    }
  }

  saveFilesHelper(filesJson, filenames, onError, onSuccess) {
    this.filesToUpload = [...filenames];
    this.fileUploadsFailed = [];
    filenames.forEach(filename => {
      const fileContents = filesJson[filename].text;
      // write file with SAVE_RETRY_COUNT failure retries
      this.writeSingleFileToBackpack(
        filename,
        fileContents,
        onError,
        onSuccess,
        SAVE_RETRY_COUNT
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
          this.onUploadComplete(filename, onError, onSuccess, error);
        }
      } else {
        this.onUploadComplete(filename, onError, onSuccess);
      }
    });
  }

  // Mark the given file as done uploading/attempting to upload.
  // Check if all files are done uploading. If they are, call either onSuccess
  // or onError depending on if we saw any errors.
  onUploadComplete(filename, onError, onSuccess, error) {
    const filenameIndex = this.filesToUpload.indexOf(filename);
    if (filenameIndex >= 0) {
      this.filesToUpload.splice(filenameIndex, 1);
    }
    if (
      this.filesToUpload.length === 0 &&
      this.fileUploadsFailed.length === 0
    ) {
      onSuccess();
    } else if (this.filesToUpload.length === 0) {
      onError(error);
    }
  }
}
