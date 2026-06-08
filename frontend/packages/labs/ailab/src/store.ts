import {createStore} from 'redux';

import rootReducer from './redux';

// The Redux store singleton. It lives in its own module — rather than in the
// package entry (`index.tsx`) — so the modules that need it can import it
// without forming an import cycle through `index.tsx` and the component tree
// that entry pulls in.
export const store = createStore(rootReducer);
