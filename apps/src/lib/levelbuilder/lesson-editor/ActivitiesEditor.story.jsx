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
        key: 'section-3',
        position: 1,
        displayName: 'Making programs',
        remarks: true,
        slide: false,
        levels: [],
        text:
          'Today we are going to be looking at some sample apps to explore their purpose and function.',
        tips: []
      },
      {
        key: 'section-1',
        position: 2,
        displayName: '',
        remarks: false,
        slide: true,
        levels: [],
        text: 'In this activity you will be learning about making activities.',
        tips: [
          {
            key: 'tip-1',
            type: 'teachingTip',
            markdown:
              'After students are finished writing in their journals, discuss as a class or collect the journals to review student answers. \n- An input could be a user clicking a button or tapping the screen. \n- An output could be an image displayed or a sound played'
          }
        ]
      },
      {
        tips: [],
        key: 'progression-1',
        position: 3,
        displayName: 'Programming Progression',
        remarks: false,
        slide: false,
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
            activeId: 1,
            ids: [1],
            kind: 'puzzle',
            skin: null,
            videoKey: null,
            concepts: '',
            conceptDifficulty: '',
            named: false,
            assessment: false,
            challenge: false
          },
          {
            status: 'not started',
            url: 'https://levelbuilder-studio.code.org/levels/598/edit',
            icon: 'fa-desktop',
            name: 'Level 2',
            isUnplugged: false,
            levelNumber: 2,
            isCurrentLevel: false,
            isConceptLevel: false,
            sublevels: [],
            position: 2,
            activeId: 2,
            ids: [2, 3],
            kind: 'assessment',
            skin: null,
            videoKey: null,
            concepts: '',
            conceptDifficulty: '',
            named: false,
            assessment: true,
            challenge: false
          }
        ]
      },
      {
        key: 'section-2',
        displayName: 'Discussion',
        position: 4,
        remarks: false,
        slide: false,
        levels: [],
        text:
          '**Prompt:** With a partner, discuss the following and note down in your journal:\n - How does the user interact with the app?\n - What is the overall purpose of this app?\n - Who is the target audience?\n\n**Share Out:** As a class, discuss student answers to the discussion questions.',
        tips: [
          {
            key: 'tip-2',
            type: 'discussionGoal',
            markdown: 'Make sure to get to the point'
          },
          {
            key: 'tip-3',
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
    time: 0,
    position: 2,
    activitySections: [
      {
        key: 'section-1',
        text: '',
        displayName: '',
        remarks: false,
        slide: false,
        tips: [],
        levels: [],
        position: 1
      }
    ]
  }
];

const levelKeyList = {
  1: 'Level 1',
  2: 'Level 2 - 1',
  3: 'Level 2 - 2',
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
