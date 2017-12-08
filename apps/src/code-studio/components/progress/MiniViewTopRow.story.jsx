import React from 'react';
import MiniViewTopRow from './MiniViewTopRow';
import progress from '@cdo/apps/code-studio/progressRedux';

export default storybook => {
  const initialState = {
    progress: {
      stages: [
        {
          levels: []
        }
      ],
      focusAreaStageIds: [],
      isSummaryView: false,
      professionalLearningCourse: false
    }
  };

  storybook
    .storiesOf('MiniViewTopRow', module)
    .withReduxStore({progress}, initialState)
    .addStoryTable([
      {
        name: 'basic',
        story: () => {
          return (
            <div style={{width: 635, position: 'relative'}}>
              <MiniViewTopRow
                scriptName="course1"
                linesOfCodeText="Total lines of code: 120"
              />
            </div>
          );
        }
      },
      {
        name: 'no lines of text',
        story: () => {
          return (
            <div style={{width: 635, position: 'relative'}}>
              <MiniViewTopRow
                scriptName="course1"
              />
            </div>
          );
        }
      }
    ]);
};
