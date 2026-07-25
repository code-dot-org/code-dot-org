import {PayloadAction, createSlice} from '@reduxjs/toolkit';

export interface BlocklyState {
  hasIncompatibleSources: boolean;
  failedToGenerateCode: boolean;
  setupBlockColor: string | null;
}

const initialState: BlocklyState = {
  // hasIncompatibleSources is set to true if we try to load json sources in
  // CDO Blockly, which only supports xml.
  hasIncompatibleSources: false,
  // If we failed to generate code from blocks for any reason.
  failedToGenerateCode: false,
  // The current main workspace setup block color. Shared lab controls use this
  // to follow Blockly theme changes.
  setupBlockColor: null,
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
    setSetupBlockColor(state, action: PayloadAction<string | null>) {
      state.setupBlockColor = action.payload;
    },
  },
});

export const {
  setHasIncompatibleSources,
  setFailedToGenerateCode,
  setSetupBlockColor,
} = blocklySlice.actions;

export default blocklySlice.reducer;
