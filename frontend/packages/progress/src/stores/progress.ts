import {configureStore} from "@reduxjs/toolkit";
import {useDispatch} from 'react-redux';

import progressReducer from "../reducers/progress";

const store = configureStore({
  reducer: {
    progress: progressReducer,
  },
});

export type RootState = ReturnType<typeof store['getState']>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export default store;
