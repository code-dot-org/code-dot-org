import {createSlice} from '@reduxjs/toolkit';
export interface ProjectInfoDialogState {
  isOpen: boolean;
}

const initialState: ProjectInfoDialogState = {
  isOpen: false,
};

const projectInfoDialogReduxSlice = createSlice({
  name: 'projectInfoDialog',
  initialState,
  reducers: {
    showProjectInfoDialog: state => {
      state.isOpen = true;
    },
    hideProjectInfoDialog: state => {
      state.isOpen = false;
    },
  },
});

export const {showProjectInfoDialog, hideProjectInfoDialog} =
  projectInfoDialogReduxSlice.actions;

export default projectInfoDialogReduxSlice.reducer;
