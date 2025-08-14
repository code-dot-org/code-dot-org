import {configureStore} from "@reduxjs/toolkit";
import {useDispatch} from 'react-redux';

import predictLevelSlice from "../reducers/predictLevel";

const store = configureStore({
  reducer: {
    predictLevel: predictLevelSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store['getState']>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export default store;
