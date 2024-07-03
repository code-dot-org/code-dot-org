import * as importFuncs from '@cdo/apps/applab/import';
import screensReducer, {
  toggleImportScreen,
  changeScreen,
  fetchProject,
  importIntoProject,
} from '@cdo/apps/applab/redux/screens';
import {
  sources as sourcesApi,
  channels as channelsApi,
  assets as assetsApi,
} from '@cdo/apps/clientApi';


import {createStore} from '../../../util/redux';
import {allowConsoleErrors} from '../../../util/testUtils';

describe('Applab Screens Reducer', function () {
  var store;

  beforeEach(() => {
    store = createStore(screensReducer);
  });

  it('should initialize to the following', function () {
    expect(store.getState().isImportingScreen).toBe(false);
    expect(store.getState().currentScreenId).toBeNull();
  });

  describe('the toggleImportScreen action', () => {
    it('will toggle the isImportingScreen state', () => {
      store.dispatch(toggleImportScreen(true));
      expect(store.getState().isImportingScreen).toBe(true);
    });

    it('will reset the importProject state', () => {
      store.dispatch(toggleImportScreen(true));
      const initialImportProject = store.getState().importProject;
      store.dispatch(fetchProject('invalid url'));
      expect(store.getState().importProject.equals(initialImportProject)).toBe(false);

      store.dispatch(toggleImportScreen(false));
      expect(store.getState().importProject.equals(initialImportProject)).toBe(true);
    });
  });

  describe('the changeScreen action', () => {
    it('will set the currentScreenId state', () => {
      store.dispatch(changeScreen('new screen id'));
      expect(store.getState().currentScreenId).toBe('new screen id');
    });
  });

  describe('the fetchProject action', () => {
    let xhr;
    let lastRequest;

    beforeEach(() => {
      xhr = sinon.useFakeXMLHttpRequest();
      xhr.onCreate = req => {
        lastRequest = req;
      };

      jest.spyOn(sourcesApi, 'ajax').mockClear().mockImplementation();
      jest.spyOn(sourcesApi, 'withProjectId').mockClear().mockImplementation().returnsThis();
      jest.spyOn(channelsApi, 'ajax').mockClear().mockImplementation();
      jest.spyOn(channelsApi, 'withProjectId').mockClear().mockImplementation().returnsThis();
      jest.spyOn(assetsApi, 'getFiles').mockClear().mockImplementation();
      jest.spyOn(assetsApi, 'withProjectId').mockClear().mockImplementation().returnsThis();
    });

    afterEach(() => {
      sourcesApi.ajax.mockRestore();
      sourcesApi.withProjectId.mockRestore();
      channelsApi.ajax.mockRestore();
      channelsApi.withProjectId.mockRestore();
      assetsApi.getFiles.mockRestore();
      assetsApi.withProjectId.mockRestore();

      xhr.mockRestore();
    });

    describe('when given an invalid url', () => {
      it('will set the errorFetchingProject state', () => {
        store.dispatch(fetchProject('invalid url'));
        lastRequest.respond(404);

        var state = store.getState();
        expect(state.importProject.isFetchingProject).toBe(false);
        expect(state.importProject.errorFetchingProject).toBe(true);
      });
    });

    describe('when given a valid url', () => {
      beforeEach(() => {
        store.dispatch(
          fetchProject(
            'http://studio.code.org:3000/projects/applab/GmBgH7e811sZP7-5bALAxQ/edit'
          )
        );
      });

      it('will set the isFetchingProject state to true', () => {
        var state = store.getState();
        expect(state.importProject.isFetchingProject).toBe(true);
      });

      it('will fetch the channel via the channels api', () => {
        expect(channelsApi.ajax).toHaveBeenCalled();
      });

      it('will fetch the sources via the sources api', () => {
        expect(sourcesApi.ajax).toHaveBeenCalled();
      });

      describe('and when sources and channels finish loading', () => {
        var sourcesSuccess,
          sourcesFail,
          channelsSuccess,
          channelsFail,
          assetsSuccess,
          existingAssetsSuccess;
        beforeEach(() => {
          [, , sourcesSuccess, sourcesFail] = sourcesApi.ajax.mock.calls[0];
          [, , channelsSuccess, channelsFail] = channelsApi.ajax.mock.calls[0];
          [existingAssetsSuccess] = assetsApi.getFiles.mock.calls[0];
          [assetsSuccess] = assetsApi.getFiles.mock.calls[1];
        });

        describe('and sources fail', () => {
          beforeEach(() => sourcesFail());
          it('will set isFetchingProject=false and errorFetchingProject=true', () => {
            expect(store.getState().importProject.isFetchingProject).toBe(false);
            expect(store.getState().importProject.errorFetchingProject).toBe(true);
          });
        });
        describe('and channels fail', () => {
          beforeEach(() => channelsFail());
          it('will set isFetchingProject=false and errorFetchingProject=true', () => {
            expect(store.getState().importProject.isFetchingProject).toBe(false);
            expect(store.getState().importProject.errorFetchingProject).toBe(true);
          });
        });
        describe('and everything succeeds', () => {
          beforeEach(() => {
            channelsSuccess({response: '"bar"'});
            sourcesSuccess({response: '"foo"'});
            assetsSuccess({files: []});
            existingAssetsSuccess({files: []});
          });
          it('will set isFetchingProject=false and fetchedProject=the fetched results', () => {
            expect(store.getState().importProject.isFetchingProject).toBe(false);
            expect(store.getState().importProject.fetchedProject).toEqual({
              channel: 'bar',
              sources: 'foo',
              assets: [],
              existingAssets: [],
            });
            expect(store.getState().importProject.importableProject).not.toBeNull();
          });
        });
      });
    });
  });

  describe('the importIntoProject action', () => {
    allowConsoleErrors();

    var resolve, reject;

    beforeEach(() => {
      jest.spyOn(importFuncs, 'importScreensAndAssets').mockClear().mockReturnValue(
        new Promise((_resolve, _reject) => {
          resolve = _resolve;
          reject = _reject;
        })
      );
    });

    afterEach(() => {
      importFuncs.importScreensAndAssets.mockRestore();
    });

    it('will set the isImportingProject flag to true at first', () => {
      expect(store.getState().importProject.isImportingProject).toBe(false);
      store.dispatch(importIntoProject('some-project', [], []));
      expect(store.getState().importProject.isImportingProject).toBe(true);
    });

    it('will call importScreensAndAssets', () => {
      store.dispatch(importIntoProject('some-project', [], []));
      expect(importFuncs.importScreensAndAssets).toHaveBeenCalled();
    });

    describe('after importScreensAndAssets has been called', () => {
      beforeEach(() => {
        store.dispatch(importIntoProject('some-project', [], []));
      });

      it('will set the isImportingProject flag to false on success', done => {
        resolve();
        setTimeout(() => {
          expect(store.getState().importProject.isImportingProject).toBe(false);
          done();
        }, 0);
      });

      it('will set the isImportingScreen flag to false on success', done => {
        resolve();
        setTimeout(() => {
          expect(store.getState().isImportingScreen).toBe(false);
          done();
        }, 0);
      });

      it('will set the isImportingProject flag to false on failure', done => {
        reject();
        setTimeout(() => {
          expect(store.getState().importProject.isImportingProject).toBe(false);
          done();
        }, 0);
      });
    });
  });
});
