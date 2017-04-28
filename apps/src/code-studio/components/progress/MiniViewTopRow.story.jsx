import React from 'react';
import MiniViewTopRow from './MiniViewTopRow';
import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import progress from '@cdo/apps/code-studio/progressRedux';
import experiments from '@cdo/apps/util/experiments';

export default storybook => {
  const initialState = {
    progress: {
      stages: [
        {
          levels: []
        }
      ],
      focusAreaPositions: [],
      isSummaryView: false,
    }
  };

  storybook
    .storiesOf('MiniViewTopRow', module)
    .addStoryTable([
      {
        name: 'basic',
        story: () => {
          const store = createStore(combineReducers({progress}), initialState);
          experiments.setEnabled('progressRedesign', true);
          return (
            <Provider store={store}>
              <div style={{width: 635, position: 'relative'}}>
                <MiniViewTopRow
                  scriptName="course1"
                  linesOfCodeText="Total lines of code: 120"
                />
              </div>
            </Provider>
          );
        }
      },
      {
        name: 'no lines of text',
        story: () => {
          const store = createStore(combineReducers({progress}), initialState);
          experiments.setEnabled('progressRedesign', true);
          return (
            <Provider store={store}>
              <div style={{width: 635, position: 'relative'}}>
                <MiniViewTopRow
                  scriptName="course1"
                />
              </div>
            </Provider>
          );
        }
      }
    ]);
};
