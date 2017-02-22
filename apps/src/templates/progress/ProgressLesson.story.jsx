import React from 'react';
import { UnconnectedProgressLesson as ProgressLesson } from './ProgressLesson';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import Immutable from 'immutable';

const defaultProps = {
  title: "Lesson 1: Bytes and File Sizes" ,
  lesson: {
    name: "Maze",
    id: 1
  },
  lessonNumber: 3,
  levels: [
    {
      status: 'not_tried',
      url: '/step1/level1',
      name: 'First progression'
    },
    {
      status: 'perfect',
      url: '/step2/level1',
    },
    {
      status: 'not_tried',
      url: '/step2/level2',
    },
    {
      status: 'not_tried',
      url: '/step2/level3',
    },
    {
      status: 'not_tried',
      url: '/step2/level4',
    },
    {
      status: 'not_tried',
      url: '/step2/level5',
    },
    {
      status: 'not_tried',
      url: '/step3/level1',
      name: 'Last progression'
    },
  ],
  viewAs: ViewType.Teacher,
  sectionId: "11",
  hiddenStageState: Immutable.fromJS({
    bySection: {
      '11': { }
    }
  })
};

export default storybook => {
  storybook
    .storiesOf('ProgressLesson', module)
    .addStoryTable([
      {
        name:'progress lesson',
        story: () => (
          <ProgressLesson
            {...defaultProps}
          />
        )
      },
      {
        name:'hidden progress lesson as teacher',
        description: 'should be white with some opacity',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            hiddenStageState={Immutable.fromJS({
              bySection: {
                '11': { '1': true}
              }
            })}
          />
        )
      },
      {
        name:'hidden progress lesson as student',
        description: 'should not show up',
        story: () => (
          <ProgressLesson
            {...defaultProps}
            viewAs={ViewType.Student}
            hiddenStageState={Immutable.fromJS({
              bySection: {
                '11': { '1': true}
              }
            })}
          />
        )
      }
    ]);
};
