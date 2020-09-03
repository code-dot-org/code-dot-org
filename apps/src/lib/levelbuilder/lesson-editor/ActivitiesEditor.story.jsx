import React from 'react';
import ActivitiesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitiesEditor';
import {createStoreWithReducers, registerReducers} from '@cdo/apps/redux';
import reducers, {
  init
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import {Provider} from 'react-redux';

const activities = [
  {
    key: 'activity-1',
    displayName: 'Main Activity',
    position: 1,
    time: 20,
    activitySections: [
      {
        type: 'description',
        key: 'section-3',
        position: 1,
        displayName: 'Making programs',
        isRemarks: true,
        slide: false,
        text:
          'Today we are going to be looking at some sample apps to explore their purpose and function.',
        tips: []
      },
      {
        type: 'description',
        key: 'section-1',
        position: 2,
        displayName: null,
        isRemarks: false,
        slide: true,
        text: 'In this activity you will be learning about making activities.',
        tips: [
          {
            type: 'teachingTip',
            markdown:
              'After students are finished writing in their journals, discuss as a class or collect the journals to review student answers. \n- An input could be a user clicking a button or tapping the screen. \n- An output could be an image displayed or a sound played'
          }
        ]
      },
      {
        type: 'progression',
        tips: [],
        key: 'progression-1',
        position: 3,
        displayName: 'Programming Progression',
        text: 'This progression teaches you programming!',
        levels: [
          {
            status: 'not started',
            url: 'https://levelbuilder-studio.code.org/levels/598/edit',
            name: 'Level 1',
            icon: 'fa-desktop',
            isUnplugged: false,
            levelNumber: 1,
            isCurrentLevel: false,
            isConceptLevel: true,
            sublevels: [],
            position: 1,
            activeId: 5,
            ids: [5],
            kind: 'puzzle',
            skin: null,
            videoKey: null,
            concepts: '',
            conceptDifficulty: '',
            named: false,
            assessment: false,
            displayName: 'Level 1',
            challenge: false
          },
          {
            status: 'not started',
            url: 'https://levelbuilder-studio.code.org/levels/598/edit',
            icon: 'fa-desktop',
            name: 'Level 1',
            isUnplugged: false,
            levelNumber: 2,
            isCurrentLevel: false,
            isConceptLevel: false,
            sublevels: [],
            position: 2,
            activeId: 10,
            ids: [10],
            kind: 'assessment',
            skin: null,
            videoKey: null,
            concepts: '',
            conceptDifficulty: '',
            named: false,
            assessment: true,
            challenge: false,
            displayName: 'Level 2'
          }
        ]
      },
      {
        type: 'description',
        key: 'section-2',
        displayName: 'Discussion',
        position: 4,
        isRemarks: false,
        slide: false,
        text:
          '**Prompt:** With a partner, discuss the following and note down in your journal:\n - How does the user interact with the app?\n - What is the overall purpose of this app?\n - Who is the target audience?\n\n**Share Out:** As a class, discuss student answers to the discussion questions.',
        tips: [
          {
            type: 'discussionGoal',
            markdown: 'Make sure to get to the point'
          },
          {
            type: 'assessmentOpportunity',
            markdown: 'Are students getting it?'
          }
        ]
      }
    ]
  },
  {
    key: 'activity-2',
    displayName: '',
    time: null,
    position: 2,
    activitySections: [
      {
        type: 'description',
        key: 'section-1',
        title: null,
        isRemarks: false,
        slide: false,
        text: '',
        tips: []
      },
      {
        type: 'progression',
        tips: [],
        key: 'progression-1',
        displayName: '',
        text: '',
        levels: []
      }
    ]
  }
];

const levelKeyList = {
  1: 'Level One',
  2: 'Level Two',
  3: 'Level Three',
  4: 'blockly:Studio:playlab_1'
};

const createStore = () => {
  registerReducers({...reducers});
  const store = createStoreWithReducers();
  store.dispatch(init(activities, levelKeyList));
  return store;
};
export default storybook => {
  storybook.storiesOf('ActivitiesEditor', module).addStoryTable([
    {
      name: 'ActivitiesEditor',
      story: () => (
        <Provider store={createStore()}>
          <ActivitiesEditor />
        </Provider>
      )
    }
  ]);
};
