/* globals $ */
import clientApi from '@cdo/apps/code-studio/initApp/clientApi';
import {getUserSections} from '@cdo/apps/util/userSectionClient';

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
    getUserSections(sections => {
      // TODO: Add backend controller action so this doesn't require multiple AJAX requests or this super clunky promise structure.
      let requests = [];
      let allLibraries = [];
      let promises = [];
      let libraryIds = {};
      sections.forEach(section => {
        requests.push(
          $.ajax({
            url: `/dashboardapi/v1/projects/section/${section.id}`,
            method: 'GET',
            dataType: 'json'
          })
        );
      });
      requests.forEach(request => {
        promises.push(
          new Promise((resolve, reject) => {
            $.when(request)
              .done(data => {
                if (data) {
                  let libraries = data
                    .filter(library => !!library.libraryName)
                    .map(library => {
                      library.name = library.libraryName;
                      library.description = library.libraryDescription;
                      return library;
                    });
                  libraries.forEach(library => {
                    if (!libraryIds[library.channel]) {
                      allLibraries.push(library);
                      libraryIds[library.channel] = true;
                    }
                  });
                }
                resolve();
              })
              .fail(error => {
                console.warn('Error finding class libraries: ' + error);
                reject();
              });
          })
        );
      });
      Promise.all(promises).then(() => {
        onSuccess(allLibraries);
      });
    });
  }
}
