import clientApi from '@cdo/apps/code-studio/initApp/clientApi';
import i18n from '@cdo/javalab/locale';

const SAVE_RETRY_COUNT = 1;

export default class BackpackClientApi {
  constructor(channelId) {
    this.backpackApi = clientApi.create('/v3/libraries');
    this.channelId = channelId;
    this.uploadingFiles = false;
    this.filesToUpload = [];
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

  saveFiles(filesJson, filenames, onError, onSuccess) {
    if (this.filesToUpload.length > 0) {
      // save is currently in progress, return an error
      onError(i18n.backpackSaveInProgress());
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
    this.filesToUpload = filenames;
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
          onError(error);
        }
      } else {
        this.onSingleUploadSuccess(filename, onSuccess);
      }
    });
  }

  onSingleUploadSuccess(filename, onOverallSuccess) {
    const filenameIndex = this.filesToUpload.indexOf(filename);
    if (filenameIndex >= 0) {
      this.filesToUpload.splice(filenameIndex, 1);
    }
    if (this.filesToUpload.length === 0) {
      onOverallSuccess();
    }
  }
}
