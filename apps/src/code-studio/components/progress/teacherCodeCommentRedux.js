// Action types

const SHOW_COMMENT_MODAL = 'teacherCodeComment/SHOW_COMMENT_MODAL';
const HIDE_COMMENT_MODAL = 'teacherCodeComment/HIDE_COMMENT_MODAL';

// Reducer

const initialState = {
  isOpen: false,
  position: null,
  lineNumber: null
};

export default function reducer(state = initialState, action) {
  console.log('reducer', state, action);
  switch (action.type) {
    case SHOW_COMMENT_MODAL:
      return {
        ...state,
        isOpen: true,
        lineNumber: action.lineNumber,
        position: action.position
      };
    case HIDE_COMMENT_MODAL:
      return {
        ...state,
        isOpen: false,
        lineNumber: null,
        position: null
      };
    default:
      return state;
  }
}

// Action creators

export function showCommentModal(lineNumber, position) {
  return {type: SHOW_COMMENT_MODAL, lineNumber, position};
}

export function hideCommentModal() {
  return {type: HIDE_COMMENT_MODAL};
}
