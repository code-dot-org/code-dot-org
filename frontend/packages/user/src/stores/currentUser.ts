import {configureStore} from "@reduxjs/toolkit";
import {useDispatch} from 'react-redux';

import currentUserReducer from "../reducers/currentUser";

const store = configureStore({
  reducer: {
    currentUser: currentUserReducer,
  },
});

export type RootState = ReturnType<typeof store['getState']>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export default store;
