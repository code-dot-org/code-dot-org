import React from 'react';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import StageProgress from './StageProgress';
import sections from '../../sectionsRedux';
import stageLock from '../../stageLockRedux';
import progress, { initProgress } from '../../progressRedux';

export default storybook => {
  const store = createStore(combineReducers({progress, stageLock, sections}));
  store.dispatch(initProgress({
    currentLevelId: '2723',
    scriptName: 'csp1',
    saveAnswersBeforeNavigation: false,
    stages: [{
      id: 123,
      levels: [
        {
          ids: [
            5086
          ],
          activeId: 5086,
          position: 1,
          kind: "puzzle",
          icon: "fa-file-text",
          title: 1,
          url: "http://studio.code.org/s/csp1/stage/2/puzzle/1",
          freePlay: false,
          progression: "Lesson Vocabulary & Resources",
        },
        {
          ids: [
            2723
          ],
          activeId: 2723,
          position: 2,
          kind: "assessment",
          icon: "fa-check-square-o",
          title: 2,
          url: "http://studio.code.org/s/csp1/stage/2/puzzle/2",
          freePlay: false,
          progression: "Check Your Understanding",
        },
        {
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
          progression: "Check Your Understanding",
        },
        {
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
          progression: "Check Your Understanding",
        },
        {
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
          progression: "Check Your Understanding",
        }
      ]
    }]
  }));

  storybook
    .storiesOf('StageProgress', module)
    .addStoryTable([
      {
        name: 'StageProgress example',
        // Provide an outer div to simulate some of the CSS that gets leaked into
        // this component
        story: () => {
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
