import React from 'react';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import StageProgress from './StageProgress';
import stageLock from '../../stageLockRedux';
import progress, { initProgress } from '../../progressRedux';

const activityPuzzle = {
  ids: [
    123
  ],
  activeId: 123,
  position: 1,
  kind: "puzzle",
  icon: "",
  title: 1,
  url: "http://studio.code.org/s/course1/stage/3/puzzle/2",
  freePlay: false,
  is_concept_level: false,
};

const conceptPuzzle = {
  ids: [
    5086
  ],
  activeId: 5086,
  position: 2,
  kind: "puzzle",
  icon: "fa-file-text",
  title: 2,
  url: "http://studio.code.org/s/csp1/stage/2/puzzle/1",
  freePlay: false,
  progression: "Lesson Vocabulary & Resources",
  is_concept_level: true,
};

const assessment1 = {
  ids: [
    2441
  ],
  activeId: 2441,
  position: 3,
  kind: "assessment",
  icon: "fa-check-square-o",
  title: 3,
  url: "http://studio.code.org/s/csp1/stage/2/puzzle/3",
  freePlay: false,
  progression: "Check Your Understanding"
};

const assessment2 = {
  ids: [
    2444
  ],
  activeId: 2444,
  position: 4,
  kind: "assessment",
  icon: "fa-check-square-o",
  title: 4,
  url: "http://studio.code.org/s/csp1/stage/2/puzzle/4",
  freePlay: false,
  progression: "Check Your Understanding"
};

const assessment3 = {
  ids: [
    2744
  ],
  activeId: 2744,
  position: 5,
  kind: "assessment",
  icon: "fa-check-square-o",
  title: 5,
  url: "http://studio.code.org/s/csp1/stage/2/puzzle/5",
  freePlay: false,
  progression: "Check Your Understanding"
};

const unplugged = {
  ids: [
    2093
  ],
  activeId: 2093,
  is_concept_level: false,
  kind: 'unplugged',
  // kind: 'puzzle',
  position: 1,
  title: 1,
  url: "http://studio.code.org/s/course1/stage/1/puzzle/1",
};

export default storybook => {
  const createStoreForLevels = (levels, currentLevelIndex) => {
    const store = createStore(combineReducers({progress, stageLock}));
    store.dispatch(initProgress({
      currentLevelId: levels[currentLevelIndex].ids[0].toString(),
      scriptName: 'csp1',
      saveAnswersBeforeNavigation: false,
      stages: [{
        id: 123,
        levels
      }]
    }));
    return store;
  };

  storybook
    .storiesOf('StageProgress', module)
    .addStoryTable([
      {
        name: 'StageProgress example',
        // Provide an outer div to simulate some of the CSS that gets leaked into
        // this component
        story: () => {
          const store = createStoreForLevels([
            activityPuzzle,
            conceptPuzzle,
            assessment1,
            assessment2,
            assessment3,
          ], 4);
          return (
            <div style={{display: 'inline-block'}} className="header_level">
              <Provider store={store}>
                <StageProgress/>
              </Provider>
            </div>
          );
        }
      },

      {
        name: 'with unplugged level as current level',
        // Provide an outer div to simulate some of the CSS that gets leaked into
        // this component
        story: () => {
          const store = createStoreForLevels([
            unplugged,
            assessment1
          ], 0);
          return (
            <div style={{display: 'inline-block'}} className="header_level">
              <Provider store={store}>
                <StageProgress/>
              </Provider>
            </div>
          );
        }
      },

      {
        name: 'with unplugged level as non-current level',
        // Provide an outer div to simulate some of the CSS that gets leaked into
        // this component
        story: () => {
          const store = createStoreForLevels([
            unplugged,
            assessment1
          ], 1);
          return (
            <div style={{display: 'inline-block'}} className="header_level">
              <Provider store={store}>
                <StageProgress/>
              </Provider>
            </div>
          );
        }
      },
    ]);
};
