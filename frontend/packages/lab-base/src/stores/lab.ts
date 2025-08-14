import {configureStore} from "@reduxjs/toolkit";
import {useDispatch} from 'react-redux';

import labSlice from "../reducers/lab";

const store = configureStore({
  reducer: {
    lab: labSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store['getState']>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export default store;
