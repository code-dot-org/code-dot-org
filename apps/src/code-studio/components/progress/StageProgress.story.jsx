import React from 'react';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import StageProgress from './StageProgress';
import stageLock from '../../stageLockRedux';
import progress, { initProgress } from '../../progressRedux';

const activityPuzzle = {
  activeId: 123,
  position: 1,
  url: "http://studio.code.org/s/course1/stage/3/puzzle/2",
  levels: [{
    id: 123,
    kind: "puzzle",
    icon: "",
    title: 1,
    freePlay: false,
    is_concept_level: false,
  }],
};

const conceptPuzzle = {
  activeId: 5086,
  position: 2,
  url: "http://studio.code.org/s/csp1/stage/2/puzzle/1",
  progression: "Lesson Vocabulary & Resources",
  levels: [{
    id: 5086,
    kind: "puzzle",
    icon: "fa-file-text",
    title: 2,
    freePlay: false,
    is_concept_level: true,
  }],
};

const assessment1 = {
  activeId: 2441,
  position: 3,
  url: "http://studio.code.org/s/csp1/stage/2/puzzle/3",
  progression: "Check Your Understanding",
  levels: [{
    id: 2441,
    kind: "assessment",
    icon: "fa-check-square-o",
    title: 3,
    freePlay: false,
  }],
};

const assessment2 = {
  activeId: 2444,
  position: 4,
  url: "http://studio.code.org/s/csp1/stage/2/puzzle/4",
  progression: "Check Your Understanding",
  levels: [{
    id: 2444,
    kind: "assessment",
    icon: "fa-check-square-o",
    title: 4,
    freePlay: false,
  }]
};

const assessment3 = {
  activeId: 2744,
  position: 5,
  url: "http://studio.code.org/s/csp1/stage/2/puzzle/5",
  progression: "Check Your Understanding",
  levels: [{
    id: 2744,
    kind: "assessment",
    icon: "fa-check-square-o",
    title: 5,
    freePlay: false,
  }],
};

const unplugged = {
  activeId: 2093,
  position: 1,
  url: "http://studio.code.org/s/course1/stage/1/puzzle/1",
  levels: [{
    id: 2093,
    is_concept_level: false,
    kind: 'unplugged',
    title: 1,
  }]
};

export default storybook => {
  const createStoreForScriptLevels = (script_levels, currentLevelIndex) => {
    const store = createStore(combineReducers({progress, stageLock}));
    store.dispatch(initProgress({
      currentLevelId: script_levels[currentLevelIndex].levels[0].id.toString(),
      scriptName: 'csp1',
      saveAnswersBeforeNavigation: false,
      stages: [{
        id: 123,
        script_levels
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
          const store = createStoreForScriptLevels([
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
          const store = createStoreForScriptLevels([
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
          const store = createStoreForScriptLevels([
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
