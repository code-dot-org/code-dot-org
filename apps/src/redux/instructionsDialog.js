const OPEN_DIALOG = 'instructionsDialog/OPEN_DIALOG';
const CLOSE_DIALOG = 'instructionsDialog/CLOSE_DIALOG';

const initialState = {
  open: false,
  autoClose: false,
  imgOnly: false
};

export default function reducer(state = initialState, action) {
  if (action.type === OPEN_DIALOG) {
    if (state.open === true) {
      throw new Error('dialog is already open');
    }
    return {
      open: true,
      autoClose: action.autoClose,
      imgOnly: action.imgOnly,
      imgUrl: action.imgUrl
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

export const openDialog = ({autoClose, imgOnly, imgUrl}) => ({
  type: OPEN_DIALOG,
  autoClose,
  imgOnly,
  imgUrl
});

export const closeDialog = () => ({type: CLOSE_DIALOG});
