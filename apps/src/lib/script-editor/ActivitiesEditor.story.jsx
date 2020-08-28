import React from 'react';
import ActivitiesEditor from './ActivitiesEditor';
import EditTipDialog from './EditTipDialog';
import PreviewActivityDialog from './PreviewActivityDialog';
import AddLevelDialog from './AddLevelDialog';
import ActivityCard from './ActivityCard';

const activity = {
  key: 'activity-1',
  displayName: 'Main Activity',
  time: 20,
  activitySections: [
    {
      type: 'description',
      key: 'section-3',
      title: 'Making programs',
      isRemarks: true,
      slide: false,
      text:
        'Today we are going to be looking at some sample apps to explore their purpose and function.',
      tips: []
    },
    {
      type: 'description',
      key: 'section-1',
      title: null,
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
      displayName: 'Programming Progression',
      text: 'This progression teaches you programming!',
      levels: [
        {
          status: 'not started',
          url: '/link/to/level',
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
          url: '/link/to/level',
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
      title: 'Discussion',
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
};

const defaultActivity = {
  key: 'activity-2',
  displayName: '',
  time: null,
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
};

const activities = [activity, defaultActivity];

export default storybook => {
  storybook.storiesOf('ActivitiesEditor', module).addStoryTable([
    {
      name: 'New Lesson',
      story: () => <ActivitiesEditor activities={[defaultActivity]} />
    },
    {
      name: 'ActivitiesEditor',
      story: () => <ActivitiesEditor activities={activities} />
    },
    {
      name: 'ActivityCard',
      story: () => <ActivityCard activity={activity} />
    },
    {
      name: 'EditTipDialog',
      story: () => (
        <EditTipDialog
          isOpen={true}
          handleConfirm={() => {
            console.log('Close Dialog');
          }}
          tip={{
            type: 'teachingTip',
            markdown: 'Make sure you pass out the packets.'
          }}
        />
      )
    },
    {
      name: 'PreviewActivityDialog',
      story: () => (
        <PreviewActivityDialog
          isOpen={true}
          handleConfirm={() => {
            console.log('Close Dialog');
          }}
          activity={activity}
        />
      )
    },
    {
      name: 'AddLevelDialog',
      story: () => (
        <AddLevelDialog
          isOpen={true}
          handleConfirm={() => {
            console.log('Close Dialog');
          }}
          currentLevels={activity.activitySections[2].levels}
        />
      )
    }
  ]);
};
