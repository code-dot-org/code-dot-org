/** @file Track the app's layout */
import {PayloadAction, createSlice} from '@reduxjs/toolkit';

interface LayoutState {
  visualizationScale: number | null;
}

const initialState: LayoutState = {
  visualizationScale: null,
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    setVisualizationScale(state, action: PayloadAction<number>) {
      state.visualizationScale = action.payload;
    },
  },
});

export const {setVisualizationScale} = layoutSlice.actions;

export default layoutSlice.reducer;
