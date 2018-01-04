/** @file Store feedback about the student's solution */

const SHOW_FEEDBACK = 'feedback/show_feedback';
const HIDE_FEEDBACK = 'feedback/hide_feedback';
const SET_BLOCK_LIMIT = 'feedback/set_block_limit';
const SET_FEEDBACK_DATA = 'feedback/set_data';

const initialState = {
  displayingFeedback: false,
  displayingCode: false,
  displayingShareControls: false,


  isPerfect: true,
  blocksUsed: 0,
  blockLimit: undefined,
  achievements: [],
  displayFunometer: true,
  studentCode: '',
  canShare: false,
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
      isPerfect,
      blocksUsed,
      achievements,
      displayFunometer,
      studentCode,
      canShare,
    } = action;
    return {
      ...state,
      isPerfect,
      blocksUsed,
      achievements,
      displayFunometer,
      studentCode,
      canShare,
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

export const setFeedbackData = (props) => {
  return {
    type: SET_FEEDBACK_DATA,
    ...props,
  };
};
