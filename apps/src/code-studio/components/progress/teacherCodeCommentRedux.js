// Action types

const SHOW_COMMENT_MODAL = 'teacherCodeComment/SHOW_COMMENT_MODAL';
const HIDE_COMMENT_MODAL = 'teacherCodeComment/HIDE_COMMENT_MODAL';
const SET_COMMENTS = 'teacherCodeComment/SET_COMMENTS';
const ADD_OR_UPDATE_COMMENT = 'teacherCodeComment/ADD_OR_UPDATE_COMMENT';

// Reducer

const initialState = {
  isOpen: false,
  position: null,
  lineNumber: null,
  comments: {}
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

export function showCommentModal(lineNumber, position) {
  return {type: SHOW_COMMENT_MODAL, lineNumber, position};
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
