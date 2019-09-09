import reducer, * as animationPickerModule from '@cdo/apps/p5lab/AnimationPicker/animationPickerModule';
import {expect} from '../../../util/configuredChai';
var Goal = animationPickerModule.Goal;

describe('animationPickerModule', function() {
  describe('reducer', function() {
    var initialState = {
      visible: false,
      goal: null,
      uploadInProgress: false,
      uploadFilename: null,
      uploadError: null
    };

    it('has expected default state', function() {
      expect(reducer(undefined, {})).to.deep.equal(initialState);
    });

    it('returns original state on unhandled action', function() {
      var state = {};
      expect(reducer(state, {})).to.equal(state);
    });

    describe('action: show', function() {
      var show = animationPickerModule.show;

      it('sets state to visible if state was not visible', function() {
        var state = {};
        var newState = reducer(state, show(Goal.NEW_ANIMATION));
        expect(newState).not.to.equal(state);
        expect(newState.visible).to.be.true;
      });

      it('sets goal to provided goal', function() {
        var state = {};
        var newState = reducer(state, show(Goal.NEW_ANIMATION));
        expect(newState).not.to.equal(state);
        expect(newState.goal).to.equal(Goal.NEW_ANIMATION);

        state = {};
        newState = reducer(state, show(Goal.NEW_FRAME));
        expect(newState).not.to.equal(state);
        expect(newState.goal).to.equal(Goal.NEW_FRAME);
      });

      it('returns original state if already visible', function() {
        var state = {visible: true};
        var newState = reducer(state, show(Goal.NEW_ANIMATION));
        expect(newState).to.equal(state);
      });
    });

    describe('action: hide', function() {
      var hide = animationPickerModule.hide;

      it('sets state to not visible if state was visible', function() {
        var state = {visible: true};
        var newState = reducer(state, hide());
        expect(newState).not.to.equal(state);
        expect(newState.visible).to.be.false;
      });

      it('removes goal', function() {
        var state = {visible: true, goal: Goal.NEW_ANIMATION};
        var newState = reducer(state, hide());
        expect(newState).not.to.equal(state);
        expect(newState.goal).to.be.null;
      });
    });

    describe('action: beginUpload', function() {
      var beginUpload = animationPickerModule.beginUpload;

      it('sets uploadInProgress', function() {
        var newState = reducer(initialState, beginUpload('filename.png'));
        expect(newState).not.to.equal(initialState);
        expect(newState.uploadInProgress).to.be.true;
      });

      it('records the upload filename', function() {
        var filename = 'filename.png';
        var newState = reducer(initialState, beginUpload(filename));
        expect(newState).not.to.equal(initialState);
        expect(newState.uploadFilename).to.equal(filename);
      });
    });

    describe('action: handleUploadError', function() {
      var handleUploadError = animationPickerModule.handleUploadError;

      it('unsets uploadInProgress', function() {
        var state = {uploadInProgress: true};
        var newState = reducer(state, handleUploadError('Error Status'));
        expect(newState).not.to.equal(state);
        expect(newState.uploadInProgress).to.be.false;
      });

      it('records the error status', function() {
        var status = 'Error Status';
        var newState = reducer(initialState, handleUploadError(status));
        expect(newState).not.to.equal(initialState);
        expect(newState.uploadError).to.equal(status);
      });
    });
  });
});
