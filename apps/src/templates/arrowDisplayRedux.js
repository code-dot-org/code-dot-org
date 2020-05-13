const SET_ARROW_BUTTONS_VISIBLE = 'arrowDisplay/SET_ARROW_BUTTONS_VISIBLE';
const SET_ARROW_BUTTONS_HIDDEN = 'arrowDisplay/SET_ARROW_BUTTONS_HIDDEN';
const SET_ARROW_BUTTONS_DISABLED = 'arrowDisplay/SET_ARROW_BUTTONS_DISABLED';

const initialState = {
  buttonsAreVisible: false,
  buttonsAreDisabled: true
};

export default function arrowDisplay(state = initialState, action) {
  switch (action.type) {
    case SET_ARROW_BUTTONS_VISIBLE:
      return {
        ...state,
        buttonsAreVisible: true
      };
    case SET_ARROW_BUTTONS_HIDDEN:
      return {
        ...state,
        buttonsAreVisible: false
      };
    case SET_ARROW_BUTTONS_DISABLED:
      return {
        ...state,
        buttonsAreDisabled: action.isDisabled
      };
    default:
      return state;
  }
}

export function showArrowButtons() {
  return {type: SET_ARROW_BUTTONS_VISIBLE};
}

export function hideArrowButtons() {
  return {type: SET_ARROW_BUTTONS_HIDDEN};
}

export function setArrowButtonDisabled(isDisabled) {
  return {type: SET_ARROW_BUTTONS_DISABLED, isDisabled};
}
