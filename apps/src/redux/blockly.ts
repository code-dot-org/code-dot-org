import {PayloadAction, createSlice} from '@reduxjs/toolkit';

export interface BlocklyState {
  hasIncompatibleSources: boolean;
  failedToGenerateCode: boolean;
}

const initialState: BlocklyState = {
  // hasIncompatibleSources is set to true if we try to load json sources in
  // CDO Blockly, which only supports xml.
  hasIncompatibleSources: false,
  // If we failed to generate code from blocks for any reason.
  failedToGenerateCode: false,
};

const blocklySlice = createSlice({
  name: 'blockly',
  initialState,
  reducers: {
    setHasIncompatibleSources(state, action: PayloadAction<boolean>) {
      state.hasIncompatibleSources = action.payload;
    },
    setFailedToGenerateCode(state, action: PayloadAction<boolean>) {
      state.failedToGenerateCode = action.payload;
    },
  },
});

export const {setHasIncompatibleSources, setFailedToGenerateCode} =
  blocklySlice.actions;

export default blocklySlice.reducer;
