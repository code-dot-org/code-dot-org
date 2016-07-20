import {expect} from '../../../util/configuredChai';
import 'babel-polyfill';
import sinon from 'sinon';

import {
  sources as sourcesApi,
  channels as channelsApi,
} from '@cdo/apps/clientApi';
import {createStore} from '@cdo/apps/redux';
import screensReducer, {
  toggleImportScreen,
  changeScreen,
  fetchProject
} from '@cdo/apps/applab/redux/screens';

describe("Applab Screens Reducer", function () {

  var store;

  beforeEach(() => {
    store = createStore(screensReducer);
  });

  it("should initialize to the following", function () {
    expect(store.getState().isImportingScreen).to.equal(false);
    expect(store.getState().currentScreenId).to.equal(null);
  });

  describe("the toggleImportScreen action", () => {
    it("will toggle the isImportingScreen state", () => {
      store.dispatch(toggleImportScreen(true));
      expect(store.getState().isImportingScreen).to.equal(true);
    });
  });

  describe("the changeScreen action", () => {
    it("will set the currentScreenId state", () => {
      store.dispatch(changeScreen('new screen id'));
      expect(store.getState().currentScreenId).to.equal('new screen id');
    });
  });

  describe("the fetchProject action", () => {

    beforeEach(() => {
      sinon.stub(sourcesApi, 'ajax');
      sinon.stub(sourcesApi, 'withProjectId').returnsThis();
      sinon.stub(channelsApi, 'ajax');
      sinon.stub(channelsApi, 'withProjectId').returnsThis();
    });

    afterEach(() => {
      sourcesApi.ajax.restore();
      sourcesApi.withProjectId.restore();
      channelsApi.ajax.restore();
      channelsApi.withProjectId.restore();
    });

    describe("when given an invalid url", () => {
      it("will set the errorFetchingProject state", () => {
        store.dispatch(fetchProject('invalid url'));
        var state = store.getState();
        expect(state.importProject.isFetchingProject).to.be.false;
        expect(state.importProject.errorFetchingProject).to.be.true;
      });
    });

    describe("when given a valid url", () => {

      beforeEach(() => {
        store.dispatch(fetchProject('http://studio.code.org:3000/projects/applab/GmBgH7e811sZP7-5bALAxQ/edit'));
      });

      it("will set the isFetchingProject state to true", () => {
        var state = store.getState();
        expect(state.importProject.isFetchingProject).to.be.true;
      });

      it("will fetch the channel via the channels api", () => {
        expect(channelsApi.ajax.called).to.be.true;
      });

      it("will fetch the sources via the sources api", () => {
        expect(sourcesApi.ajax.called).to.be.true;
      });

      describe("and when sources and channels finish loading", () => {
        var sourcesSuccess, sourcesFail, channelsSuccess, channelsFail;
        beforeEach(() => {
          [, , sourcesSuccess, sourcesFail] = sourcesApi.ajax.firstCall.args;
          [, , channelsSuccess, channelsFail] = channelsApi.ajax.firstCall.args;
        });

        describe("and sources fail", () => {
          beforeEach(() => sourcesFail());
          it("will set isFetchingProject=false and errorFetchingProject=true", () => {
            expect(store.getState().importProject.isFetchingProject).to.be.false;
            expect(store.getState().importProject.errorFetchingProject).to.be.true;
          });
        });
        describe("and channels fail", () => {
          beforeEach(() => channelsFail());
          it("will set isFetchingProject=false and errorFetchingProject=true", () => {
            expect(store.getState().importProject.isFetchingProject).to.be.false;
            expect(store.getState().importProject.errorFetchingProject).to.be.true;
          });
        });
        describe("and both sources and channels succeed", () => {
          beforeEach(() => {
            channelsSuccess({response: '"bar"'});
            sourcesSuccess({response: '"foo"'});
          });
          it("will set isFetchingProject=false and fetchedProject=the fetched results", () => {
            expect(store.getState().importProject.isFetchingProject).to.be.false;
            expect(store.getState().importProject.fetchedProject).to.deep.equal({
              channel: 'bar',
              sources: 'foo'
            });
          });
        });

      });
    });
  });

});
