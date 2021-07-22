import clientApi from '@cdo/apps/code-studio/initApp/clientApi';
//import libraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';

export default class BackpackClientApi {
  constructor() {
    this.backpackApi = clientApi.create('/v3/libraries');
    this.channelId = null;
    this.uploadingFiles = false;
    this.filesToUpload = [];
  }

  fetchChannelId(callback) {
    $.ajax({
      url: '/backpacks/channel',
      type: 'get'
    }).done(response => {
      this.channelId = response;
      callback();
    });
  }

  saveFiles(filesJson, filenames, onError, onSuccess) {
    if (!this.channelId) {
      this.fetchChannelId(
        this.saveFilesHelper(filesJson, filenames, onError, onSuccess)
      );
    } else {
      this.saveFilesHelper(filesJson, filenames, onError, onSuccess);
    }
  }

  saveFilesHelper = (filesJson, filenames, onError, onSuccess) => {
    if (filenames.length === 0) {
      onSuccess();
      return;
    }
    this.filesToUpload = filenames;
    filenames.forEach(filename => {
      const fileContents = filesJson[filename].text;
      // write file with 1 failure retry
      this.writeSingleFileToBackpack(
        filename,
        fileContents,
        // onError: retry first failure, then call onError message on second failure
        this.writeSingleFileToBackpack(filename, fileContents, onError, () =>
          this.onSingleUploadSuccess(filename, onSuccess)
        ),
        () => this.onSingleUploadSuccess(filename, onSuccess)
      );
    });
  };

  writeSingleFileToBackpack(filename, fileContents, onError, onSuccess) {
    this.backpackApi.put(
      this.channelId,
      fileContents,
      filename,
      (error, data) => {
        if (error) {
          onError(error);
        } else {
          onSuccess();
        }
      }
    );
  }

  onSingleUploadSuccess(filename, onOverallSuccess) {
    if (this.filesToUpload.includes(filename)) {
      this.filesToUpload.remove(filename);
    }
    if (this.filesToUpload.length === 0) {
      onOverallSuccess();
    }
  }
}
