/** @file Track the app's layout */
import {PayloadAction, createSelector, createSlice} from '@reduxjs/toolkit';

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

const selectSelf = (state: {layout: LayoutState}) => state.layout;

export const getVisualizationScale = createSelector(
  selectSelf,
  state => state?.visualizationScale
);

export default layoutSlice.reducer;
