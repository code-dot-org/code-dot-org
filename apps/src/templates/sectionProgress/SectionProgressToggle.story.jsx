import React from 'react';
import {UnconnectedSectionProgressToggle as SectionProgressToggle} from './SectionProgressToggle';
import {ViewType} from './sectionProgressConstants';

export default storybook => {
  function isSummaryTrue() {
    return {
      name: 'Summary view toggle on',
      story: () => (
        <SectionProgressToggle
          currentView={ViewType.SUMMARY}
          setCurrentView={() => {
            console.log('Toggle view.');
          }}
        />
      )
    };
  }

  function isSummaryFalse() {
    return {
      name: 'Detail view toggle on',
      story: () => (
        <SectionProgressToggle
          currentView={ViewType.DETAIL}
          setCurrentView={() => {
            console.log('Toggle view.');
          }}
        />
      )
    };
  }

  function isStandardsTrue() {
    return {
      name: 'Standards view toggle on',
      story: () => (
        <SectionProgressToggle
          currentView={ViewType.STANDARDS}
          showStandardsToggle={true}
          setCurrentView={() => {
            console.log('Toggle view.');
          }}
        />
      )
    };
  }

  storybook
    .storiesOf('Progress/SectionProgressToggle', module)
    .withReduxStore()
    .addStoryTable([isSummaryTrue(), isSummaryFalse(), isStandardsTrue()]);
};
