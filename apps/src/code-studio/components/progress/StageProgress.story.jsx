import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { UnconnectedStageProgress as StageProgress } from './StageProgress';
import { ViewType } from '../../stageLockRedux';
import { SignInState } from '../../progressRedux';

export default storybook => {
  const store = createStore(state => state, {
    progress: {
      currentLevelId: "2441",
      saveAnswersBeforeNavigation: false,
      postMilestoneDisabled: false,
      signInState: SignInState.SignedIn,
      levelProgress: {},
    },
    stageLock: {
      viewAs: ViewType.Student,
      stagesBySectionId: {
      }
    },
    sections: {
      selectedSectionId: 123
    },
  });

  const defaultProps = {
    "levels": [
      {
        "ids": [
          5086
        ],
        "activeId": 5086,
        "position": 1,
        "kind": "puzzle",
        "icon": "fa-file-text",
        "title": 1,
        "url": "http://studio.code.org/s/csp1/stage/2/puzzle/1",
        "freePlay": false,
        "progression": "Lesson Vocabulary & Resources"
      },
      {
        "ids": [
          2723
        ],
        "activeId": 2723,
        "position": 2,
        "kind": "assessment",
        "icon": "fa-list-ol",
        "title": 2,
        "url": "http://studio.code.org/s/csp1/stage/2/puzzle/2",
        "freePlay": false,
        "progression": "Check Your Understanding"
      },
      {
        "ids": [
          2441
        ],
        "activeId": 2441,
        "position": 3,
        "kind": "assessment",
        "icon": "fa-list-ol",
        "title": 3,
        "url": "http://studio.code.org/s/csp1/stage/2/puzzle/3",
        "freePlay": false,
        "progression": "Check Your Understanding"
      },
      {
        "ids": [
          2444
        ],
        "activeId": 2444,
        "position": 4,
        "kind": "assessment",
        "icon": "fa-list-ol",
        "title": 4,
        "url": "http://studio.code.org/s/csp1/stage/2/puzzle/4",
        "freePlay": false,
        "progression": "Check Your Understanding"
      },
      {
        "ids": [
          2744
        ],
        "activeId": 2744,
        "position": 5,
        "kind": "assessment",
        "icon": "fa-list-ol",
        "title": 5,
        "url": "http://studio.code.org/s/csp1/stage/2/puzzle/5",
        "freePlay": false,
        "progression": "Check Your Understanding"
      }
    ],
    "stageId": 1402
  };

  storybook
    .storiesOf('StageProgress', module)
    .addStoryTable([
      {
        name: 'StageProgress example',
        // Provide an outer div to simulate some of the CSS that gets leaked into
        // this component
        story: () => (
          <div style={{display: 'inline-block'}} className="header_level">
            <Provider store={store}>
              <StageProgress
                {...defaultProps}
              />
            </Provider>
          </div>
        )
      },
    ]);
};
