import React from 'react';
import {action} from '@storybook/addon-actions';
import {UnconnectedProgressDetailToggle as ProgressDetailToggle} from './ProgressDetailToggle';
import progress from '@cdo/apps/code-studio/progressRedux';

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
              setIsSummaryView={action('setIsSummaryView')}
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
            setIsSummaryView={action('setIsSummaryView')}
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
            setIsSummaryView={action('setIsSummaryView')}
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
            setIsSummaryView={action('setIsSummaryView')}
          />
        )
      }
    ]);
};
