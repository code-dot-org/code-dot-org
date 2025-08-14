import {configureStore} from "@reduxjs/toolkit";
import {useDispatch} from 'react-redux';

import predictLevelReducer from "../reducers/predictLevel";

const store = configureStore({
  reducer: {
    predictLevel: predictLevelReducer,
  },
});

export type RootState = ReturnType<typeof store['getState']>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export default store;
