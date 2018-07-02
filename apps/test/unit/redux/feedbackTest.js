import reducer, * as feedback from '@cdo/apps/redux/feedback';
import {expect} from '../../util/configuredChai';

describe('feedback redux module', () => {
  it('has expected default state', () => {
    expect(reducer(undefined, {})).to.deep.equal({
      displayingFeedback: false,
      displayingCode: false,
      displayingShareControls: false,

      isChallenge: false,
      isPerfect: true,
      blocksUsed: 0,
      blockLimit: undefined,
      achievements: [],
      displayFunometer: true,
      studentCode: {
        message: '',
        code: '',
      },
      feedbackImage: null,
    });
  });

  it('returns original state on unhandled action', () => {
    const state = { fakeProp: 'fakeValue' };
    expect(reducer(state, { type: 'fakeAction' })).to.equal(state);
  });

  describe('action: show and hide feedback', () => {
    const state = {
      displayingFeedback: false,
      displayingShareControls: false,
    };
    it('sets the displayingFeedback property to true', () => {
      const newState = reducer(state, feedback.showFeedback());
      expect(newState).to.deep.equal({
        displayingFeedback: true,
        displayingShareControls: false,
      });
    });

    it('sets the displayingFeedback property to false', () => {
      const intermediateState = reducer(state, feedback.showFeedback());
      const newState = reducer(intermediateState, feedback.hideFeedback());
      expect(newState).to.deep.equal({
        displayingFeedback: false,
        displayingShareControls: false,
      });
    });

    it('produces a new object', () => {
      const showState = reducer(state, feedback.showFeedback());
      expect(showState).not.to.equal(state);
    });
  });

  describe('action: setBlockLimit', () => {
    it('changes the blockLimit property', () => {
      const state = {};
      const newState = reducer(state, feedback.setBlockLimit(42));
      expect(newState).to.deep.equal({
        blockLimit: 42,
      });
    });

    it('clears the blockLimit property', () => {
      const state = { blockLimit: 42 };
      const newState = reducer(state, feedback.setBlockLimit(undefined));
      expect(newState).to.deep.equal({
        blockLimit: undefined,
      });
    });
  });

  describe('action: setFeedbackData', () => {
    it('sets all the properties', () => {
      const state = {};
      const newState = reducer(state, feedback.setFeedbackData({
        isChallenge: true,
        isPerfect: true,
        blocksUsed: 19,
        displayFunometer: false,
        studentCode: 'console.log("hello world!");',
        feedbackImage: 'fake_image.png',
      }));
      expect(newState).to.deep.equal({
        isChallenge: true,
        isPerfect: true,
        blocksUsed: 19,
        displayFunometer: false,
        studentCode: 'console.log("hello world!");',
        feedbackImage: 'fake_image.png',
      });
    });
  });
});
