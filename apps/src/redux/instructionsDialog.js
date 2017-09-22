const OPEN_DIALOG = 'instructionsDialog/OPEN_DIALOG';
const CLOSE_DIALOG = 'instructionsDialog/CLOSE_DIALOG';

const initialState = {
  open: false,
  autoClose: false,
  imgOnly: false,
  hintsOnly: false
};

export default function reducer(state = initialState, action) {
  if (action.type === OPEN_DIALOG) {
    if (state.open === true) {
      throw new Error('dialog is already open');
    }
    if (action.imgOnly && action.hintsOnly) {
      throw new Error('cant have imgOnly and hintsOnly');
    }
    return {
      open: true,
      autoClose: action.autoClose,
      imgOnly: action.imgOnly,
      hintsOnly: action.hintsOnly,
      imgUrl: action.imgUrl,
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

export const openDialog = ({autoClose, imgOnly, hintsOnly, imgUrl}) => ({
  type: OPEN_DIALOG,
  autoClose,
  imgOnly,
  hintsOnly,
  imgUrl,
});

export const closeDialog = () => ({ type: CLOSE_DIALOG });
