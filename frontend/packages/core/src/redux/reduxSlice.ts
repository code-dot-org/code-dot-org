import {createSlice} from '@reduxjs/toolkit';

export interface ReduxState {
  /** The number of reducers currently loaded */
  reducerCount: number;
}

const initialState: ReduxState = {
  reducerCount: 0,
};

const reduxSlice = createSlice({
  name: 'redux',
  initialState,
  reducers: {
    incrementCount: state => {
      state.reducerCount++;
    },
    resetCount: state => {
      state.reducerCount = 0;
    },
  },
});

export const {incrementCount, resetCount} = reduxSlice.actions;

export default reduxSlice;
