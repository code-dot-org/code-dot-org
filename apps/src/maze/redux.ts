import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface MazeState {
  collectorCurrentCollected: number;
  collectorLastCollected: number;
  collectorMinRequired: number;
}

const initialState: MazeState = {
  collectorCurrentCollected: 0,
  collectorLastCollected: 0,
  collectorMinRequired: 1,
};

const mazeSlice = createSlice({
  name: 'maze',
  initialState,
  reducers: {
    resetCollectorCurrentCollected(state) {
      state.collectorCurrentCollected = 0;
    },
    setCollectorCurrentCollected(state, action: PayloadAction<number>) {
      state.collectorCurrentCollected = action.payload;
      state.collectorLastCollected = action.payload;
    },
    setCollectorMinRequired(state, action: PayloadAction<number>) {
      state.collectorMinRequired = action.payload;
    },
  },
});

export const {
  resetCollectorCurrentCollected,
  setCollectorCurrentCollected,
  setCollectorMinRequired,
} = mazeSlice.actions;

export default mazeSlice.reducer;
