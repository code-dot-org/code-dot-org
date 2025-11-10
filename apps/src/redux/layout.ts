/** @file Track the app's layout */
import {PayloadAction, createSelector, createSlice} from '@reduxjs/toolkit';

export interface LayoutState {
  visualizationScale: number | null;
  // TODO: Remove isAiDiffContainerOpen when https://codedotorg.atlassian.net/browse/AITT-1281 is implemented.
  isAiDiffContainerOpen: boolean;
}

const initialState: LayoutState = {
  visualizationScale: null,
  isAiDiffContainerOpen: false,
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    setVisualizationScale(state, action: PayloadAction<number>) {
      state.visualizationScale = action.payload;
    },
    setIsAiDiffContainerOpen(state, action: PayloadAction<boolean>) {
      state.isAiDiffContainerOpen = action.payload;
    },
  },
});

export const {setVisualizationScale, setIsAiDiffContainerOpen} =
  layoutSlice.actions;

const selectSelf = (state: {layout: LayoutState}) => state.layout;

export const getVisualizationScale = createSelector(
  selectSelf,
  state => state?.visualizationScale
);

export default layoutSlice.reducer;
