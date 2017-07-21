import React from 'react';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';

import CollectorGemCounter from './CollectorGemCounter';
import mazeReducer from './redux';

export default storybook => {
const store = createStore(combineReducers({maze: mazeReducer}));
  return storybook
    .storiesOf('CollectorGemCounter', module)
    .addStoryTable([
      {
        name: 'With default props',
        story: () => (
          <Provider store={store}>
            <div style={{position: 'relative'}}>
              <CollectorGemCounter />
            </div>
          </Provider>
        )
      }
    ]);
};

