import {configureStore} from '@reduxjs/toolkit';

import rootReducer, {setTrainedModel} from './redux';

// The Redux store singleton. It lives in its own module — rather than in the
// package entry (`index.tsx`) — so the modules that need it can import it
// without forming an import cycle through `index.tsx` and the component tree
// that entry pulls in.
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // state.trainedModel is a live KNN class instance used for predictions,
      // so it (and the action that sets it) are intentionally non-serializable.
      // TODO: hoist the model out of Redux into a module singleton, as was done
      // for the metrics/instructions callbacks, then drop this exception.
      serializableCheck: {
        ignoredPaths: ['trainedModel'],
        ignoredActions: [setTrainedModel.type],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;
