/* globals fetch */
import clientApi from '@cdo/apps/code-studio/initApp/clientApi';

const LIBRARY_NAME = 'library.json';
export default class LibraryClientApi {
  constructor(channelId) {
    this.channelId = channelId;
    this.libraryApi = clientApi.create('/v3/libraries');
  }

  publish(library, onError, onSuccess) {
    this.libraryApi.put(
      this.channelId,
      JSON.stringify(library),
      LIBRARY_NAME,
      (error, data) => {
        if (error) {
          onError(error);
        } else {
          onSuccess(data);
        }
      }
    );
  }

  fetchLatest(onSuccess, onError) {
    this.libraryApi.fetch(
      this.channelId + '/' + LIBRARY_NAME,
      (error, data) => {
        if (data) {
          onSuccess(data);
        } else {
          onError(error);
        }
      }
    );
  }

  fetchLatestVersionId(onSuccess, onError) {
    this.libraryApi.fetch(
      this.channelId + '/' + LIBRARY_NAME + '/versions',
      (error, data) => {
        if (data) {
          let mostRecent = data.find(libraryVersion => {
            return libraryVersion.isLatest;
          });
          onSuccess(mostRecent.versionId);
        } else {
          onError(error);
        }
      }
    );
  }

  fetchByVersion(versionId, onSuccess, onError) {
    let library;
    this.libraryApi.fetch(
      this.channelId + '/' + LIBRARY_NAME + '?version=' + versionId,
      (error, data) => {
        if (data) {
          onSuccess(data);
        } else {
          onError(error);
        }
      }
    );
    return library;
  }

  delete() {
    this.libraryApi.deleteObject(this.channelId + '/' + LIBRARY_NAME, error => {
      if (error) {
        // In the future, errors will be surfaced to the user in the libraries dialog
        console.warn('Error deleting library: ' + error);
      }
    });
  }

  async getClassLibraries(onSuccess, onError) {
    let data;
    try {
      let response = await fetch('/api/v1/section_libraries/', {
        method: 'GET'
      });
      if (!response.ok) {
        onError(response.status + ': ' + response.statusText);
        return;
      }

      data = await response.json();
    } catch (error) {
      onError(error);
    }
    onSuccess(data);
  }
}
