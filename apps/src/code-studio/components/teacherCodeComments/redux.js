// Action types

const SHOW_COMMENT_MODAL = 'teacherCodeComments/SHOW_COMMENT_MODAL';
const HIDE_COMMENT_MODAL = 'teacherCodeComments/HIDE_COMMENT_MODAL';
const SET_COMMENTS = 'teacherCodeComments/SET_COMMENTS';
const ADD_OR_UPDATE_COMMENT = 'teacherCodeComments/ADD_OR_UPDATE_COMMENT';

// Reducer

const initialState = {
  comments: {},
  hasBreakpoint: null,
  isOpen: false,
  lineNumber: null,
  position: null
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_COMMENT_MODAL:
      return {
        ...state,
        hasBreakpoint: action.hasBreakpoint,
        isOpen: true,
        lineNumber: action.lineNumber,
        position: action.position
      };
    case HIDE_COMMENT_MODAL:
      return {
        ...initialState,
        comments: state.comments
      };
    case SET_COMMENTS:
      return {
        ...state,
        comments: action.comments
      };
    case ADD_OR_UPDATE_COMMENT:
      return {
        ...state,
        comments: {
          ...state.comments,
          [action.lineNumber]: action.comment
        }
      };
    default:
      return state;
  }
}

// Action creators

export function showCommentModal(lineNumber, position, hasBreakpoint) {
  return {type: SHOW_COMMENT_MODAL, lineNumber, position, hasBreakpoint};
}

export function hideCommentModal() {
  return {type: HIDE_COMMENT_MODAL};
}

export function setComments(comments) {
  return {type: SET_COMMENTS, comments};
}

export function addOrUpdateComment(comment, lineNumber) {
  return {type: ADD_OR_UPDATE_COMMENT, comment, lineNumber};
}
