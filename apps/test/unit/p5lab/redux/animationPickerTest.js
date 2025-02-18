import animationListReducer from '@cdo/apps/p5lab/redux/animationList';
import reducer, * as animationPicker from '@cdo/apps/p5lab/redux/animationPicker';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';

var Goal = animationPicker.Goal;

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
      expect(reducer(undefined, {})).toEqual(initialState);
    });

    it('returns original state on unhandled action', function () {
      var state = {};
      expect(reducer(state, {})).toBe(state);
    });

    describe('action: show', function () {
      var show = animationPicker.show;

      it('sets state to visible if state was not visible', function () {
        var state = {};
        var newState = reducer(state, show(Goal.NEW_ANIMATION, false));
        expect(newState).not.toBe(state);
        expect(newState.visible).toBe(true);
      });

      it('sets goal to provided goal', function () {
        var state = {};
        var newState = reducer(state, show(Goal.NEW_ANIMATION, false));
        expect(newState).not.toBe(state);
        expect(newState.goal).toBe(Goal.NEW_ANIMATION);

        state = {};
        newState = reducer(state, show(Goal.NEW_FRAME, false));
        expect(newState).not.toBe(state);
        expect(newState.goal).toBe(Goal.NEW_FRAME);
      });

      it('returns original state if already visible', function () {
        var state = {visible: true};
        var newState = reducer(state, show(Goal.NEW_ANIMATION, false));
        expect(newState).toBe(state);
      });

      it('sets state to isSpriteLab if isSpriteLab was false', function () {
        var state = {};
        var newState = reducer(state, show(Goal.NEW_ANIMATION, true));
        expect(newState).not.toBe(state);
        expect(newState.isSpriteLab).toBe(true);
      });

      it('sets state to not isBackground', function () {
        var state = {};
        var newState = reducer(state, show(Goal.NEW_ANIMATION, true));
        expect(newState.isBackground).toBe(false);
      });
    });

    describe('action: showBackground', function () {
      var showBackground = animationPicker.showBackground;

      it('sets state to isBackground', function () {
        var state = {};
        var newState = reducer(state, showBackground(Goal.NEW_ANIMATION));
        expect(newState.isBackground).toBe(true);
      });
    });

    describe('action: hide', function () {
      var hide = animationPicker.hide;

      it('sets state to not visible if state was visible', function () {
        var state = {visible: true};
        var newState = reducer(state, hide());
        expect(newState).not.toBe(state);
        expect(newState.visible).toBe(false);
      });

      it('removes goal', function () {
        var state = {visible: true, goal: Goal.NEW_ANIMATION};
        var newState = reducer(state, hide());
        expect(newState).not.toBe(state);
        expect(newState.goal).toBeNull();
      });
    });

    describe('action: beginUpload', function () {
      var beginUpload = animationPicker.beginUpload;

      it('sets uploadInProgress', function () {
        var newState = reducer(initialState, beginUpload('filename.png'));
        expect(newState).not.toBe(initialState);
        expect(newState.uploadInProgress).toBe(true);
      });

      it('records the upload filename', function () {
        var filename = 'filename.png';
        var newState = reducer(initialState, beginUpload(filename));
        expect(newState).not.toBe(initialState);
        expect(newState.uploadFilename).toBe(filename);
      });
    });

    describe('action: handleUploadError', function () {
      var handleUploadError = animationPicker.handleUploadError;

      it('unsets uploadInProgress', function () {
        var state = {uploadInProgress: true};
        var newState = reducer(state, handleUploadError('Error Status'));
        expect(newState).not.toBe(state);
        expect(newState.uploadInProgress).toBe(false);
      });

      it('records the error status', function () {
        var status = 'Error Status';
        var newState = reducer(initialState, handleUploadError(status));
        expect(newState).not.toBe(initialState);
        expect(newState.uploadError).toBe(status);
      });
    });

    describe('action: selectAnimation', function () {
      const addSelectedAnimation = animationPicker.addSelectedAnimation;

      it('adds object to selectedAnimations state', function () {
        const state = {selectedAnimations: {}};
        const newState = reducer(state, addSelectedAnimation(testAnimation));
        expect(newState).not.toBe(state);
        expect(newState.selectedAnimations[testAnimation.sourceUrl]).toEqual(
          testAnimation
        );
      });
    });

    describe('action: removeAnimation', function () {
      const removeSelectedAnimation = animationPicker.removeSelectedAnimation;

      it('removes object from selectedAnimations state', function () {
        let testAnimationState = {};
        testAnimationState[testAnimation.sourceUrl] = testAnimation;
        const state = {selectedAnimations: testAnimationState};
        const newState = reducer(state, removeSelectedAnimation(testAnimation));
        expect(newState).not.toBe(state);
        expect(Object.keys(newState.selectedAnimations).length).toBe(0);
      });
    });
  });

  describe('pickLibraryAnimation', function () {
    let pickLibraryAnimation = animationPicker.pickLibraryAnimation;
    let show = animationPicker.show;

    beforeEach(() => {
      stubRedux();
      registerReducers({
        ...commonReducers,
        animationPicker: reducer,
        animationList: animationListReducer,
      });
      getStore().dispatch(show(Goal.NEW_ANIMATION, true));
    });

    afterEach(() => {
      restoreRedux();
    });

    it('adds to the selectedAnimations object', function () {
      getStore().dispatch(pickLibraryAnimation(testAnimation));

      let newState = getStore().getState().animationPicker;
      expect(Object.keys(newState.selectedAnimations).length).toBe(1);
    });

    it('removes from the selectedAnimations object', function () {
      getStore().dispatch(pickLibraryAnimation(testAnimation));
      let newState = getStore().getState().animationPicker;
      expect(Object.keys(newState.selectedAnimations).length).toBe(1);

      getStore().dispatch(pickLibraryAnimation(testAnimation));
      newState = getStore().getState().animationPicker;
      expect(Object.keys(newState.selectedAnimations).length).toBe(0);
    });
  });

  describe('saveSelectedAnimations', function () {
    let pickLibraryAnimation = animationPicker.pickLibraryAnimation;
    let show = animationPicker.show;
    let saveSelectedAnimations = animationPicker.saveSelectedAnimations;

    beforeAll(() => {
      stubRedux();
      registerReducers(commonReducers);
      registerReducers({animationPicker: reducer});
      registerReducers({animationList: animationListReducer});
      getStore().dispatch(show(Goal.NEW_ANIMATION, true));
    });

    afterAll(() => {
      restoreRedux();
    });

    it('hides the animation picker dialog and removes selected animations', function () {
      getStore().dispatch(pickLibraryAnimation(testAnimation, true));
      getStore().dispatch(saveSelectedAnimations());

      let newState = getStore().getState().animationPicker;
      expect(newState.visible).toBe(false);
      expect(Object.keys(newState.selectedAnimations).length).toBe(0);
    });
  });
});
