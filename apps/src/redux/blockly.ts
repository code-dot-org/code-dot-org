import {PayloadAction, createSlice} from '@reduxjs/toolkit';

interface BlocklyState {
  hasIncompatibleSources: boolean;
}

const initialState: BlocklyState = {
  hasIncompatibleSources: false,
};

const blocklySlice = createSlice({
  name: 'blockly',
  initialState,
  reducers: {
    setHasIncompatibleSources(state, action: PayloadAction<boolean>) {
      state.hasIncompatibleSources = action.payload;
    },
  },
});

export const {setHasIncompatibleSources} = blocklySlice.actions;

export default blocklySlice.reducer;
