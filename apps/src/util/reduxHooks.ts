import {AnyAction, Dispatch, ThunkDispatch} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';

import {RootState} from '@cdo/apps/types/redux';

// Redux toolkit recommends getting this type from store.dispatch:
// https://redux-toolkit.js.org/usage/usage-with-typescript#getting-the-dispatch-type
// Right now our full store isn't in typescript, and we manually type what is in TypeScript
// using RootState because our store is updated programmatically.
// Therefore we are manually defining the App Dispatch type here.
export type AppDispatch = ThunkDispatch<RootState, undefined, AnyAction> &
  Dispatch<AnyAction>;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
