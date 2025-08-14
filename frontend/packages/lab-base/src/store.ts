/**
 * The expected redux store.
 */

import {useDispatch, useSelector} from 'react-redux';

import store from '@code-dot-org/redux';
import {currentUserReducer} from '@code-dot-org/user/reducers';

import {labSystemReducer, labProjectReducer} from './reducers';

store.injectReducer(currentUserReducer);
store.injectReducer(labProjectReducer);
store.injectReducer(labSystemReducer);

export type RootState = ReturnType<typeof store['getState']>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
