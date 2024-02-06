import {PayloadAction, createSlice} from '@reduxjs/toolkit';

export interface BlocklyState {
  hasIncompatibleSources: boolean;
  failedToGenerateSources: boolean;
}

const initialState: BlocklyState = {
  // hasIncompatibleSources is set to true if we try to load json sources in
  // CDO Blockly, which only supports xml.
  hasIncompatibleSources: false,
  // If we failed to generate blockly sources for any reason.
  failedToGenerateSources: false,
};

const blocklySlice = createSlice({
  name: 'blockly',
  initialState,
  reducers: {
    setHasIncompatibleSources(state, action: PayloadAction<boolean>) {
      state.hasIncompatibleSources = action.payload;
    },
    setFailedToGenerateSources(state, action: PayloadAction<boolean>) {
      state.failedToGenerateSources = action.payload;
    },
  },
});

export const {setHasIncompatibleSources, setFailedToGenerateSources} =
  blocklySlice.actions;

export default blocklySlice.reducer;
