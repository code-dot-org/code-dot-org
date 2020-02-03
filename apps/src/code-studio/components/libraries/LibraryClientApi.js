/* globals fetch */
import clientApi from '@cdo/apps/code-studio/initApp/clientApi';

const LIBRARY_NAME = 'library.json';
export default class LibraryClientApi {
  constructor(channelId) {
    this.channelId = channelId;
    this.libraryApi = clientApi.create('/v3/libraries');
    this.cacheBustSuffix = new Date().getTime();
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
          this.cacheBustSuffix = new Date().getTime();
          onSuccess(data);
        }
      }
    );
  }

  fetchLatest(onSuccess, onError) {
    this.libraryApi.fetch(
      this.channelId + '/' + LIBRARY_NAME + '?_=' + this.cacheBustSuffix,
      (error, data, _, request) => {
        if (data) {
          onSuccess(data);
        } else {
          this.cacheBustSuffix = new Date().getTime();
          onError(error, request.status);
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

  delete(onSuccess, onError) {
    this.libraryApi.deleteObject(
      this.channelId + '/' + LIBRARY_NAME,
      (error, success) => {
        if (success) {
          this.cacheBustSuffix = new Date().getTime();
          onSuccess();
        } else {
          onError(error);
        }
      }
    );
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
