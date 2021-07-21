import React from 'react';
import {
  UnconnectedProgressDetailToggle as ProgressDetailToggle
} from './ProgressDetailToggle';
import progress, {setIsSummaryView} from '@cdo/apps/code-studio/progressRedux';

export default storybook => {
  storybook
    .storiesOf('Progress/ProgressDetailToggle', module)
    .withReduxStore({progress})
    .addStoryTable([
      {
        name: 'isSummary is true',
        story: () => {
          return (
            <ProgressDetailToggle
              isPlc={false}
              isSummaryView
              hasGroups={false}
              setIsSummaryView={setIsSummaryView}
            />
          );
        }
      },
      {
        name: 'isSummary is false',
        story: () => (
          <ProgressDetailToggle
            isPlc={false}
            isSummaryView={false}
            hasGroups={false}
            setIsSummaryView={setIsSummaryView}
          />
        )
      },
      {
        name: 'isSummary is true with groups',
        story: () => (
          <ProgressDetailToggle
            isPlc={false}
            isSummaryView
            hasGroups
            setIsSummaryView={setIsSummaryView}
          />
        )
      },
      {
        name: 'isSummary is false with groups',
        story: () => (
          <ProgressDetailToggle
            isPlc={false}
            isSummaryView={false}
            hasGroups
            setIsSummaryView={setIsSummaryView}
          />
        )
      }
    ]);
};
