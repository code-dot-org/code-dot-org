/** @file Store feedback about the student's solution */

const SHOW_FEEDBACK = 'feedback/show_feedback';
const HIDE_FEEDBACK = 'feedback/hide_feedback';
const SET_ACHIEVEMENTS = 'feedback/set_achievemnts';
const SET_BLOCK_LIMIT = 'feedback/set_block_limit';
const SET_FEEDBACK_DATA = 'feedback/set_data';

const initialState = {
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
};

export default function reducer(state = initialState, action) {
  if (action.type === SHOW_FEEDBACK) {
    const { displayingShareControls } = action;
    return {
      ...state,
      displayingFeedback: true,
      displayingShareControls,
    };
  }
  if (action.type === HIDE_FEEDBACK) {
    return {
      ...state,
      displayingFeedback: false,
    };
  }
  if (action.type === SET_BLOCK_LIMIT) {
    const { blockLimit } = action;
    return {
      ...state,
      blockLimit,
    };
  }
  if (action.type === SET_FEEDBACK_DATA) {
    const {
      isChallenge,
      isPerfect,
      blocksUsed,
      displayFunometer,
      studentCode,
      feedbackImage,
    } = action;
    return {
      ...state,
      isChallenge,
      isPerfect,
      blocksUsed,
      displayFunometer,
      studentCode,
      feedbackImage,
    };
  }
  if (action.type === SET_ACHIEVEMENTS) {
    const { achievements } = action;
    return {
      ...state,
      achievements,
    };
  }
  return state;
}

export const showFeedback = (displayingShareControls = false) => ({
  type: SHOW_FEEDBACK,
  displayingShareControls,
});

export const hideFeedback = () => ({
  type: HIDE_FEEDBACK,
});

export const setBlockLimit = (blockLimit) => ({
  type: SET_BLOCK_LIMIT,
  blockLimit,
});

export const setFeedbackData = (props) => ({
  type: SET_FEEDBACK_DATA,
  ...props,
});

export const setAchievements = (achievements) => ({
  type: SET_ACHIEVEMENTS,
  achievements,
});
