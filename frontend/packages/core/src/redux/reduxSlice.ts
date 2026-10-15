import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';

export interface ReduxState {
  /** The number of slice reducers currently injected into the store. */
  reducerCount: number;
}

const initialState: ReduxState = {
  reducerCount: 0,
};

/**
 * Built-in bookkeeping slice. Every store starts from it (a store needs at
 * least one reducer), and `injectSlices` keeps `reducerCount` equal to the
 * number of distinct slices injected so far — a debugging surface for "what
 * has been loaded into this store".
 */
const reduxSlice = createSlice({
  name: 'redux',
  initialState,
  reducers: {
    setCount: (state, action: PayloadAction<number>) => {
      state.reducerCount = action.payload;
    },
  },
});

export const {setCount} = reduxSlice.actions;

export default reduxSlice;
