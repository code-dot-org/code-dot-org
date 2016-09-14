import {combineReducers} from 'redux';
import sinon from 'sinon';
import reducer, {
    START_LOADING_FROM_SOURCE,
    DONE_LOADING_FROM_SOURCE,
    setInitialAnimationList
} from '@cdo/apps/gamelab/animationListModule';
import animationTab from '@cdo/apps/gamelab/AnimationTab/animationTabModule';
import {EMPTY_IMAGE} from '@cdo/apps/gamelab/constants';
import {createStore} from '@cdo/apps/redux';
import {expect} from '../../util/configuredChai';

describe('animationListModule', function () {
  describe('loadAnimationFromSource', function () {
    // Note: I'm basically unable to test loadAnimationFromSource right now,
    // because it makes an external request for a Blob and sinon can't fake
    // a request for a blob under PhantomJS (grr) so I need to do some refactoring
    // to allow me to stub a request method.  in the meantime, I'll show
    // that the reducer responds as expected.

    const key = 'foo';
    let store;

    beforeEach(function () {
      store = createStore(combineReducers({animationList: reducer}), {
        animationList: {
          orderedKeys: [key],
          propsByKey: {
            [key]: {
              sourceUrl: 'anything (we stub this)'
            }
          }
        }
      });
    });

    it('sets the loadedFromSource flag', function () {
      // TODO run loadAnimationFromSource action here when we can stub the request
      expect(store.getState().animationList.propsByKey[key].loadedFromSource).to.be.undefined;
      store.dispatch({type: START_LOADING_FROM_SOURCE, key});
      expect(store.getState().animationList.propsByKey[key].loadedFromSource).to.be.false;
      store.dispatch({
        type: DONE_LOADING_FROM_SOURCE,
        key
      });
      expect(store.getState().animationList.propsByKey[key].loadedFromSource).to.be.true;
    });

    it('populates animation blob', function () {
      // TODO run loadAnimationFromSource action here when we can stub the request
      expect(store.getState().animationList.propsByKey[key].blob).to.be.undefined;
      store.dispatch({type: START_LOADING_FROM_SOURCE, key});
      expect(store.getState().animationList.propsByKey[key].blob).to.be.undefined;
      store.dispatch({
        type: DONE_LOADING_FROM_SOURCE,
        key,
        blob: new Blob([])
      });
      expect(store.getState().animationList.propsByKey[key].blob).not.to.be.undefined;
    });

    it('populates animation dataURI', function () {
      // TODO run loadAnimationFromSource action here when we can stub the request
      expect(store.getState().animationList.propsByKey[key].dataURI).to.be.undefined;
      store.dispatch({type: START_LOADING_FROM_SOURCE, key});
      expect(store.getState().animationList.propsByKey[key].dataURI).to.be.undefined;
      store.dispatch({
        type: DONE_LOADING_FROM_SOURCE,
        key,
        dataURI: EMPTY_IMAGE
      });
      expect(store.getState().animationList.propsByKey[key].dataURI).not.to.be.undefined;
    });

    it('populates animation sourceSize', function () {
      // TODO run loadAnimationFromSource action here when we can stub the request
      expect(store.getState().animationList.propsByKey[key].sourceSize).to.be.undefined;
      store.dispatch({type: START_LOADING_FROM_SOURCE, key});
      expect(store.getState().animationList.propsByKey[key].sourceSize).to.be.undefined;
      store.dispatch({
        type: DONE_LOADING_FROM_SOURCE,
        key,
        sourceSize: {x: 1, y: 1}
      });
      expect(store.getState().animationList.propsByKey[key].sourceSize).not.to.be.undefined;
    });
  });

  describe('action: set initial animationList', function () {
    let oldWindowDashboard, server;
    beforeEach(function () {
      oldWindowDashboard = window.dashboard;
      window.dashboard = {
        project: {
          getCurrentId() {return '';}
        }
      };

      server = sinon.fakeServer.create();
      server.respondWith('imageBody');
    });

    afterEach(function () {
      server.restore();
      window.dashboard = oldWindowDashboard;
    });

    it('when animationList has 1 item, selectedAnimation should be the animation', function () {
      const key0 = 'anim0';
      let animationList = {
        orderedKeys: [key0],
        propsByKey: {
          [key0]: {
            name: 'New animation',
            sourceUrl: null,
            frameSize: {x: 100, y: 100},
            frameCount: 1,
            looping: true,
            frameDelay: 4,
            version: null,
            loadedFromSource: true,
            saved: false,
            blob: null,
            dataURI: null,
            hasNewVersionThisSession: false
          }
        }
      };

      let store = createStore(combineReducers({animationList: reducer, animationTab}), {});
      store.dispatch(setInitialAnimationList(animationList));
      expect(store.getState().animationTab.selectedAnimation).to.equal(key0);
    });

    it('when animationList has 0 items, selectedAnimation should be null', function () {
      const key0 = 'anim0';
      let animationList = {
        orderedKeys: [],
        propsByKey: {}
      };
      let store = createStore(combineReducers({animationList: reducer, animationTab}), {});
      store.dispatch(setInitialAnimationList(animationList));
      expect(store.getState().animationTab.selectedAnimation).to.be.null;
    });
  });

});
