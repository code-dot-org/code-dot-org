import HttpClient from '@cdo/apps/util/HttpClient';

const REQUEST_RETRY_COUNT = 1;

interface FilesObject {
  [filename: string]: {
    text: string;
  };
}
interface FileMetadata {
  filename: string;
  category?: string;
  size: number;
  timestamp: string;
}

type ErrorCallback = (error?: Error, failedFiles?: string[]) => void;
const rootUrl = (channelId: string) => `/v3/libraries/${channelId}`;
// Cache bust suffix ensures we always get the latest version of the file.
const getCacheBustSuffix = () => `?t=${Date.now()}`;

export default class BackpackClientApi {
  appType: string;
  channelId: string | null;
  uploadingFiles: boolean;
  fileUploadsInProgress: string[];
  fileUploadsFailed: string[];
  fileDeletesInProgress: string[];
  fileDeletesFailed: string[];

  constructor(appType: string, channelId: string | null) {
    this.appType = appType;
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

  fetchChannelId(callback: () => void) {
    HttpClient.fetchJson<{channel: string}>(
      `/backpacks/channel/${this.appType}`
    ).then(response => {
      this.channelId = response.value.channel;
      callback();
    });
  }

  async fetchFile(
    filename: string,
    onError: ErrorCallback,
    onSuccess: (data: string) => void
  ) {
    const response = await this.fetchFileResponse(filename);
    if (!response) {
      onError();
      return;
    }
    if (response instanceof Error) {
      onError(response);
      return;
    }

    const fileContents = await response.text();
    onSuccess(fileContents);
  }

  // Fetch a file from the backpack, and return the full response object, or false/Error if the fetch fails.
  async fetchFileResponse(filename: string) {
    if (!this.channelId) {
      return false;
    }

    try {
      return await HttpClient.get(
        `${rootUrl(this.channelId!)}/${filename}${getCacheBustSuffix()}`
      );
    } catch (error) {
      return error as Error;
    }
  }

  async getFileList(
    onError: ErrorCallback,
    onSuccess: (filenames: string[]) => void
  ) {
    if (!this.channelId && this.appType === 'javalab') {
      onError();
      return;
    }
    const fetchFiles = async () => {
      try {
        const response = await HttpClient.fetchJson<FileMetadata[]>(
          rootUrl(this.channelId!)
        );
        const filenames = response.value.map(fileData => fileData.filename);
        onSuccess(filenames);
      } catch (error) {
        onError(error as Error);
      }
    };

    // Only fetch channel id if we don't yet have it. Javalab includes backpack channel_id
    // in appOptions but lab2 labs (e.g., pythonlab) do not use appOptions.
    if (!this.channelId) {
      this.fetchChannelId(() => {
        fetchFiles();
      });
    } else {
      fetchFiles();
    }
  }

  /**
   * Save files to the backpack
   * @param {Object} files all file sources in the project
   * Expected format is {"filename1.java": {"text": "{...}"},...}.
   * @param {Array} filenames Array of filenames to save to the backpack. Filenames must
   * exist in files.
   * @param {Function} onError Function to call if any file fails to save
   * @param {Function} onSuccess Function to call if all files save.
   */
  saveFiles(
    files: FilesObject,
    filenames: string[],
    onError: ErrorCallback,
    onSuccess: () => void
  ) {
    this.updateFilesHelper(
      this.fileUploadsInProgress,
      filenames,
      onError,
      onSuccess,
      () => this.saveFilesHelper(files, filenames, onError, onSuccess)
    );
  }

  /**
   * Takes a file name and contents and saves to the backpack.
   * Used in Codebridge labs to save a file.
   * @param {String} filename
   * @param {String} fileContents Contents of file to be saved to the backpack.
   * @param {Function} onError Function to call if file fails to save.
   * @param {Function} onSuccess Function to call if file saves.
   */
  saveCodebridgeFile(
    filename: string,
    fileContents: string,
    onError: ErrorCallback,
    onSuccess: () => void
  ) {
    const fileObject = {[filename]: {text: fileContents}};
    this.updateFilesHelper(
      this.fileUploadsInProgress,
      [filename],
      onError,
      onSuccess,
      () => this.saveFilesHelper(fileObject, [filename], onError, onSuccess)
    );
  }

  /**
   * Save a file to the backpack from the given URL.
   */
  async saveCodebridgeFileFromUrl(
    filename: string,
    fileUrl: string,
    onError: ErrorCallback,
    onSuccess: () => void
  ) {
    if (!this.channelId) {
      onError();
      return;
    }
    try {
      const fileResponse = await HttpClient.get(fileUrl);
      if (fileResponse.ok) {
        const responseBlob = await fileResponse.blob();
        const fileToUpload = new File([responseBlob], filename, {
          type: responseBlob.type,
        });
        await HttpClient.put(
          `${rootUrl(this.channelId)}/${filename}`,
          fileToUpload
        );
      }
    } catch (error) {
      onError(error as Error);
      return;
    }
    onSuccess();
  }

  /**
   * Delete files from the backpack
   * @param {Array} filenames Array of filenames to delete from the backpack.
   * @param {Function} onError Function to call if any file fails to delete
   * @param {Function} onSuccess Function to call if all files are deleted.
   */

  deleteFiles(
    filenames: string[],
    onError: ErrorCallback,
    onSuccess: () => void
  ) {
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
  updateFilesHelper(
    filesInProgress: string[],
    filenames: string[],
    onError: ErrorCallback,
    onSuccess: () => void,
    callback: () => void
  ) {
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

  saveFilesHelper(
    files: FilesObject,
    filenames: string[],
    onError: ErrorCallback,
    onSuccess: () => void
  ) {
    this.fileUploadsInProgress = [...filenames];
    this.fileUploadsFailed = [];
    filenames.forEach(filename => {
      const fileContents = files[filename].text;
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

  async writeSingleFileToBackpack(
    filename: string,
    fileContents: string,
    onError: ErrorCallback,
    onSuccess: () => void,
    retryCount: number
  ) {
    if (!this.channelId) {
      onError();
      return;
    }
    try {
      await HttpClient.put(
        `${rootUrl(this.channelId)}/${filename}`,
        fileContents
      );
      this.onRequestComplete(
        filename,
        this.fileUploadsInProgress,
        this.fileUploadsFailed,
        onError,
        onSuccess
      );
    } catch (error) {
      if (retryCount > 0) {
        this.writeSingleFileToBackpack(
          filename,
          fileContents,
          onError,
          onSuccess,
          retryCount - 1
        );
      } else {
        // Record failure and check if all files are done attempting upload/uploading
        this.fileUploadsFailed.push(filename);
        this.onRequestComplete(
          filename,
          this.fileUploadsInProgress,
          this.fileUploadsFailed,
          onError,
          onSuccess,
          error as Error
        );
      }
    }
  }

  deleteFilesHelper(
    filenames: string[],
    onError: ErrorCallback,
    onSuccess: () => void
  ) {
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

  async deleteSingleFileFromBackpack(
    filename: string,
    onError: ErrorCallback,
    onSuccess: () => void,
    retryCount: number
  ) {
    try {
      await HttpClient.delete(`${rootUrl(this.channelId!)}/${filename}`);
      this.onRequestComplete(
        filename,
        this.fileDeletesInProgress,
        this.fileDeletesFailed,
        onError,
        onSuccess
      );
    } catch (error) {
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
          error as Error
        );
      }
    }
  }

  // Mark the given file as done updating/attempting to update.
  // Check if all files are done updating. If they are, call either onSuccess
  // or onError depending on if we saw any errors.
  onRequestComplete(
    filename: string,
    filesInRequest: string[],
    failedFileList: string[],
    onError: ErrorCallback,
    onSuccess: () => void,
    error?: Error
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
