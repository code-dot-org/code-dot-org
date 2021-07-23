import clientApi from '@cdo/apps/code-studio/initApp/clientApi';

export default class BackpackClientApi {
  constructor(channelId) {
    this.backpackApi = clientApi.create('/v3/libraries');
    this.channelId = channelId;
    this.uploadingFiles = false;
    this.filesToUpload = [];
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

  saveFiles(filesJson, filenames, onError, onSuccess) {
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
      // write file with 1 failure retry
      this.writeSingleFileToBackpack(
        filename,
        fileContents,
        // onError: retry first failure, then call onError method on second failure
        () =>
          this.writeSingleFileToBackpack(
            filename,
            fileContents,
            onError,
            onSuccess
          ),
        onSuccess
      );
    });
  }

  writeSingleFileToBackpack(filename, fileContents, onError, onSuccess) {
    this.backpackApi.put(this.channelId, fileContents, filename, (error, _) => {
      if (error) {
        onError(error);
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
