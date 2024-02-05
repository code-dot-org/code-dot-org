import {PayloadAction, createSlice} from '@reduxjs/toolkit';

interface BlocklyState {
  hasIncompatibleSources: boolean;
  failedToLoad: boolean;
}

const initialState: BlocklyState = {
  // hasIncompatibleSources is set to true if we try to load json sources in
  // CDO Blockly, which only supports xml.
  hasIncompatibleSources: false,
  // If we failed to load blockly sources for any reason.
  failedToLoad: false,
};

const blocklySlice = createSlice({
  name: 'blockly',
  initialState,
  reducers: {
    setHasIncompatibleSources(state, action: PayloadAction<boolean>) {
      state.hasIncompatibleSources = action.payload;
    },
    setFailedToLoad(state, action: PayloadAction<boolean>) {
      state.failedToLoad = action.payload;
    },
  },
});

export const {setHasIncompatibleSources, setFailedToLoad} =
  blocklySlice.actions;

export default blocklySlice.reducer;
