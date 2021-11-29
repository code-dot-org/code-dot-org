import React from 'react';
import MiniViewTopRow from './MiniViewTopRow';
import progress from '@cdo/apps/code-studio/progressRedux';

const initialState = {
  progress: {
    lessonGroups: [],
    lessons: [
      {
        levels: []
      }
    ],
    focusAreaLessonIds: [],
    isSummaryView: false,
    professionalLearningCourse: false
  }
};

export default storybook =>
  storybook
    .storiesOf('MiniViewTopRow', module)
    .withReduxStore({progress}, initialState)
    .addStoryTable([
      {
        name: 'basic',
        story: () => (
          <div style={{width: 635, position: 'relative'}}>
            <MiniViewTopRow
              scriptName="course1"
              linesOfCodeText="Total lines of code: 120"
            />
          </div>
        )
      },
      {
        name: 'no lines of text',
        story: () => (
          <div style={{width: 635, position: 'relative'}}>
            <MiniViewTopRow scriptName="course1" />
          </div>
        )
      }
    ]);
