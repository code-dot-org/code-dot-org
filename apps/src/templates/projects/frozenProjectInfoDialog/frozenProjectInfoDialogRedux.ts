import {createSlice} from '@reduxjs/toolkit';
export interface FrozenProjectInfoDialogState {
  isOpen: boolean;
}

const initialState: FrozenProjectInfoDialogState = {
  isOpen: false,
};

const frozenProjectInfoDialogReduxSlice = createSlice({
  name: 'frozenProjectInfoDialog',
  initialState,
  reducers: {
    showFrozenProjectInfoDialog: state => {
      state.isOpen = true;
    },
    hideFrozenProjectInfoDialog: state => {
      state.isOpen = false;
    },
  },
});

export const {showFrozenProjectInfoDialog, hideFrozenProjectInfoDialog} =
  frozenProjectInfoDialogReduxSlice.actions;

export default frozenProjectInfoDialogReduxSlice.reducer;
