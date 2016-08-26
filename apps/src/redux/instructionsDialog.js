const OPEN_DIALOG = 'instructionsDialog/OPEN_DIALOG';
const CLOSE_DIALOG = 'instructionsDialog/CLOSE_DIALOG';

const initialState = {
  open: false,
  autoClose: false,
  showHints: false,
  aniGifOnly: false,
  hintsOnly: false
};

export default function reducer(state = initialState, action) {
  if (action.type === OPEN_DIALOG) {
    if (state.open === true) {
      throw new Error('dialog is already open');
    }
    if (action.aniGifOnly && action.hintsOnly) {
      throw new Error('cant have aniGifOnly and hintsOnly');
    }
    return {
      open: true,
      showHints: action.showHints,
      autoClose: action.autoClose,
      aniGifOnly: action.aniGifOnly,
      hintsOnly: action.hintsOnly
    };
  }

  if (action.type === CLOSE_DIALOG) {
    if (state.open === false) {
      throw new Error('dialog is already closed');
    }
    return {
      open: false
    };
  }
  return state;
}

export const openDialog = ({autoClose, showHints, aniGifOnly, hintsOnly}) => ({
  type: OPEN_DIALOG,
  autoClose,
  showHints,
  aniGifOnly,
  hintsOnly
});

export const closeDialog = () => ({ type: CLOSE_DIALOG });
