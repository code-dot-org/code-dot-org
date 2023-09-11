import reducer, * as animationPicker from '@cdo/apps/p5lab/redux/animationPicker';
import {expect} from '../../../util/reconfiguredChai';
var Goal = animationPicker.Goal;
import {
  getStore,
  registerReducers,
  __testing_stubRedux,
  __testing_restoreRedux,
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import animationListReducer from '@cdo/apps/p5lab/redux/animationList';

const testAnimation = {
  name: 'test_animation',
  sourceUrl: 'path/to/animation',
  frameSize: {
    x: 0,
    y: 0,
  },
  frameCount: 1,
  looping: false,
  frameDelay: 0,
  version: '',
  loadedFromSource: false,
  sourceSize: {x: 0, y: 0},
  saved: true,
  blob: null,
  dataURI: '',
  hasNewVersionThisSession: false,
  categories: [],
};

describe('animationPicker', function () {
  describe('reducer', function () {
    var initialState = {
      visible: false,
      goal: null,
      uploadInProgress: false,
      uploadFilename: null,
      uploadError: null,
      isSpriteLab: false,
      isBackground: false,
      selectedAnimations: {},
      uploadWarningShowing: false,
    };

    it('has expected default state', function () {
      expect(reducer(undefined, {})).to.deep.equal(initialState);
    });

    it('returns original state on unhandled action', function () {
      var state = {};
      expect(reducer(state, {})).to.equal(state);
    });

    describe('action: show', function () {
      var show = animationPicker.show;

      it('sets state to visible if state was not visible', function () {
        var state = {};
        var newState = reducer(state, show(Goal.NEW_ANIMATION, false));
        expect(newState).not.to.equal(state);
        expect(newState.visible).to.be.true;
      });

      it('sets goal to provided goal', function () {
        var state = {};
        var newState = reducer(state, show(Goal.NEW_ANIMATION, false));
        expect(newState).not.to.equal(state);
        expect(newState.goal).to.equal(Goal.NEW_ANIMATION);

        state = {};
        newState = reducer(state, show(Goal.NEW_FRAME, false));
        expect(newState).not.to.equal(state);
        expect(newState.goal).to.equal(Goal.NEW_FRAME);
      });

      it('returns original state if already visible', function () {
        var state = {visible: true};
        var newState = reducer(state, show(Goal.NEW_ANIMATION, false));
        expect(newState).to.equal(state);
      });

      it('sets state to isSpriteLab if isSpriteLab was false', function () {
        var state = {};
        var newState = reducer(state, show(Goal.NEW_ANIMATION, true));
        expect(newState).not.to.equal(state);
        expect(newState.isSpriteLab).to.be.true;
      });

      it('sets state to not isBackground', function () {
        var state = {};
        var newState = reducer(state, show(Goal.NEW_ANIMATION, true));
        expect(newState.isBackground).to.be.false;
      });
    });

    describe('action: showBackground', function () {
      var showBackground = animationPicker.showBackground;

      it('sets state to isBackground', function () {
        var state = {};
        var newState = reducer(state, showBackground(Goal.NEW_ANIMATION));
        expect(newState.isBackground).to.be.true;
      });
    });

    describe('action: hide', function () {
      var hide = animationPicker.hide;

      it('sets state to not visible if state was visible', function () {
        var state = {visible: true};
        var newState = reducer(state, hide());
        expect(newState).not.to.equal(state);
        expect(newState.visible).to.be.false;
      });

      it('removes goal', function () {
        var state = {visible: true, goal: Goal.NEW_ANIMATION};
        var newState = reducer(state, hide());
        expect(newState).not.to.equal(state);
        expect(newState.goal).to.be.null;
      });
    });

    describe('action: beginUpload', function () {
      var beginUpload = animationPicker.beginUpload;

      it('sets uploadInProgress', function () {
        var newState = reducer(initialState, beginUpload('filename.png'));
        expect(newState).not.to.equal(initialState);
        expect(newState.uploadInProgress).to.be.true;
      });

      it('records the upload filename', function () {
        var filename = 'filename.png';
        var newState = reducer(initialState, beginUpload(filename));
        expect(newState).not.to.equal(initialState);
        expect(newState.uploadFilename).to.equal(filename);
      });
    });

    describe('action: handleUploadError', function () {
      var handleUploadError = animationPicker.handleUploadError;

      it('unsets uploadInProgress', function () {
        var state = {uploadInProgress: true};
        var newState = reducer(state, handleUploadError('Error Status'));
        expect(newState).not.to.equal(state);
        expect(newState.uploadInProgress).to.be.false;
      });

      it('records the error status', function () {
        var status = 'Error Status';
        var newState = reducer(initialState, handleUploadError(status));
        expect(newState).not.to.equal(initialState);
        expect(newState.uploadError).to.equal(status);
      });
    });

    describe('action: selectAnimation', function () {
      const addSelectedAnimation = animationPicker.addSelectedAnimation;

      it('adds object to selectedAnimations state', function () {
        const state = {selectedAnimations: {}};
        const newState = reducer(state, addSelectedAnimation(testAnimation));
        expect(newState).not.to.equal(state);
        expect(
          newState.selectedAnimations[testAnimation.sourceUrl]
        ).to.deep.equal(testAnimation);
      });
    });

    describe('action: removeAnimation', function () {
      const removeSelectedAnimation = animationPicker.removeSelectedAnimation;

      it('removes object from selectedAnimations state', function () {
        let testAnimationState = {};
        testAnimationState[testAnimation.sourceUrl] = testAnimation;
        const state = {selectedAnimations: testAnimationState};
        const newState = reducer(state, removeSelectedAnimation(testAnimation));
        expect(newState).not.to.equal(state);
        expect(Object.keys(newState.selectedAnimations).length).to.equal(0);
      });
    });
  });

  describe('pickLibraryAnimation', function () {
    let pickLibraryAnimation = animationPicker.pickLibraryAnimation;
    let show = animationPicker.show;

    beforeEach(() => {
      __testing_stubRedux();
      registerReducers({
        ...commonReducers,
        animationPicker: reducer,
        animationList: animationListReducer,
      });
      getStore().dispatch(show(Goal.NEW_ANIMATION, true));
    });

    afterEach(() => {
      __testing_restoreRedux();
    });

    it('adds to the selectedAnimations object', function () {
      getStore().dispatch(pickLibraryAnimation(testAnimation));

      let newState = getStore().getState().animationPicker;
      expect(Object.keys(newState.selectedAnimations).length).to.equal(1);
    });

    it('removes from the selectedAnimations object', function () {
      getStore().dispatch(pickLibraryAnimation(testAnimation));
      let newState = getStore().getState().animationPicker;
      expect(Object.keys(newState.selectedAnimations).length).to.equal(1);

      getStore().dispatch(pickLibraryAnimation(testAnimation));
      newState = getStore().getState().animationPicker;
      expect(Object.keys(newState.selectedAnimations).length).to.equal(0);
    });
  });

  describe('saveSelectedAnimations', function () {
    let pickLibraryAnimation = animationPicker.pickLibraryAnimation;
    let show = animationPicker.show;
    let saveSelectedAnimations = animationPicker.saveSelectedAnimations;

    before(() => {
      __testing_stubRedux();
      registerReducers(commonReducers);
      registerReducers({animationPicker: reducer});
      registerReducers({animationList: animationListReducer});
      getStore().dispatch(show(Goal.NEW_ANIMATION, true));
    });

    after(() => {
      __testing_restoreRedux();
    });

    it('hides the animation picker dialog and removes selected animations', function () {
      getStore().dispatch(pickLibraryAnimation(testAnimation, true));
      getStore().dispatch(saveSelectedAnimations());

      let newState = getStore().getState().animationPicker;
      expect(newState.visible).to.be.false;
      expect(Object.keys(newState.selectedAnimations).length).to.equal(0);
    });
  });
});
