import {expect} from '../../../util/deprecatedChai';
import {allowConsoleErrors} from '../../../util/testUtils';
import sinon from 'sinon';

import {
  sources as sourcesApi,
  channels as channelsApi,
  assets as assetsApi
} from '@cdo/apps/clientApi';
import {createStore} from '../../../util/redux';
import screensReducer, {
  toggleImportScreen,
  changeScreen,
  fetchProject,
  importIntoProject
} from '@cdo/apps/applab/redux/screens';
import * as importFuncs from '@cdo/apps/applab/import';

describe('Applab Screens Reducer', function() {
  var store;

  beforeEach(() => {
    store = createStore(screensReducer);
  });

  it('should initialize to the following', function() {
    expect(store.getState().isImportingScreen).to.equal(false);
    expect(store.getState().currentScreenId).to.equal(null);
  });

  describe('the toggleImportScreen action', () => {
    it('will toggle the isImportingScreen state', () => {
      store.dispatch(toggleImportScreen(true));
      expect(store.getState().isImportingScreen).to.equal(true);
    });

    it('will reset the importProject state', () => {
      store.dispatch(toggleImportScreen(true));
      const initialImportProject = store.getState().importProject;
      store.dispatch(fetchProject('invalid url'));
      expect(store.getState().importProject.equals(initialImportProject)).to.be
        .false;

      store.dispatch(toggleImportScreen(false));
      expect(store.getState().importProject.equals(initialImportProject)).to.be
        .true;
    });
  });

  describe('the changeScreen action', () => {
    it('will set the currentScreenId state', () => {
      store.dispatch(changeScreen('new screen id'));
      expect(store.getState().currentScreenId).to.equal('new screen id');
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

      sinon.stub(sourcesApi, 'ajax');
      sinon.stub(sourcesApi, 'withProjectId').returnsThis();
      sinon.stub(channelsApi, 'ajax');
      sinon.stub(channelsApi, 'withProjectId').returnsThis();
      sinon.stub(assetsApi, 'getFiles');
      sinon.stub(assetsApi, 'withProjectId').returnsThis();
    });

    afterEach(() => {
      sourcesApi.ajax.restore();
      sourcesApi.withProjectId.restore();
      channelsApi.ajax.restore();
      channelsApi.withProjectId.restore();
      assetsApi.getFiles.restore();
      assetsApi.withProjectId.restore();

      xhr.restore();
    });

    describe('when given an invalid url', () => {
      it('will set the errorFetchingProject state', () => {
        store.dispatch(fetchProject('invalid url'));
        lastRequest.respond(404);

        var state = store.getState();
        expect(state.importProject.isFetchingProject).to.be.false;
        expect(state.importProject.errorFetchingProject).to.be.true;
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
        expect(state.importProject.isFetchingProject).to.be.true;
      });

      it('will fetch the channel via the channels api', () => {
        expect(channelsApi.ajax.called).to.be.true;
      });

      it('will fetch the sources via the sources api', () => {
        expect(sourcesApi.ajax.called).to.be.true;
      });

      describe('and when sources and channels finish loading', () => {
        var sourcesSuccess,
          sourcesFail,
          channelsSuccess,
          channelsFail,
          assetsSuccess,
          existingAssetsSuccess;
        beforeEach(() => {
          [, , sourcesSuccess, sourcesFail] = sourcesApi.ajax.firstCall.args;
          [, , channelsSuccess, channelsFail] = channelsApi.ajax.firstCall.args;
          [existingAssetsSuccess] = assetsApi.getFiles.firstCall.args;
          [assetsSuccess] = assetsApi.getFiles.secondCall.args;
        });

        describe('and sources fail', () => {
          beforeEach(() => sourcesFail());
          it('will set isFetchingProject=false and errorFetchingProject=true', () => {
            expect(store.getState().importProject.isFetchingProject).to.be
              .false;
            expect(store.getState().importProject.errorFetchingProject).to.be
              .true;
          });
        });
        describe('and channels fail', () => {
          beforeEach(() => channelsFail());
          it('will set isFetchingProject=false and errorFetchingProject=true', () => {
            expect(store.getState().importProject.isFetchingProject).to.be
              .false;
            expect(store.getState().importProject.errorFetchingProject).to.be
              .true;
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
            expect(store.getState().importProject.isFetchingProject).to.be
              .false;
            expect(store.getState().importProject.fetchedProject).to.deep.equal(
              {
                channel: 'bar',
                sources: 'foo',
                assets: [],
                existingAssets: []
              }
            );
            expect(store.getState().importProject.importableProject).not.to.be
              .null;
          });
        });
      });
    });
  });

  describe('the importIntoProject action', () => {
    allowConsoleErrors();

    var resolve, reject;

    beforeEach(() => {
      sinon.stub(importFuncs, 'importScreensAndAssets').returns(
        new Promise((_resolve, _reject) => {
          resolve = _resolve;
          reject = _reject;
        })
      );
    });

    afterEach(() => {
      importFuncs.importScreensAndAssets.restore();
    });

    it('will set the isImportingProject flag to true at first', () => {
      expect(store.getState().importProject.isImportingProject).to.be.false;
      store.dispatch(importIntoProject('some-project', [], []));
      expect(store.getState().importProject.isImportingProject).to.be.true;
    });

    it('will call importScreensAndAssets', () => {
      store.dispatch(importIntoProject('some-project', [], []));
      expect(importFuncs.importScreensAndAssets).to.have.been.called;
    });

    describe('after importScreensAndAssets has been called', () => {
      beforeEach(() => {
        store.dispatch(importIntoProject('some-project', [], []));
      });

      it('will set the isImportingProject flag to false on success', done => {
        resolve();
        setTimeout(() => {
          expect(store.getState().importProject.isImportingProject).to.be.false;
          done();
        }, 0);
      });

      it('will set the isImportingScreen flag to false on success', done => {
        resolve();
        setTimeout(() => {
          expect(store.getState().isImportingScreen).to.be.false;
          done();
        }, 0);
      });

      it('will set the isImportingProject flag to false on failure', done => {
        reject();
        setTimeout(() => {
          expect(store.getState().importProject.isImportingProject).to.be.false;
          done();
        }, 0);
      });
    });
  });
});
