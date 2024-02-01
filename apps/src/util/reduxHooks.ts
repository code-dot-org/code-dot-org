import {AnyAction, Dispatch, ThunkDispatch} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {RootState} from '@cdo/apps/types/reduxTypes';

// Redux toolkit recommends getting this type from store.dispatch:
// https://redux-toolkit.js.org/usage/usage-with-typescript#getting-the-dispatch-type
// Right now our store isn't in typescript, and even if it was we would face the issue
// that we define it as a singleton and therefore need to type it manually anyway, as it
// could be null. Therefore we are manually defining the App Dispatch type here, and need
// to use any because that's what redux-toolkit uses.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppDispatch = ThunkDispatch<RootState, undefined, AnyAction> &
  Dispatch<AnyAction>;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
