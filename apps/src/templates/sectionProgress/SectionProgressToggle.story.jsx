import React from 'react';
import {UnconnectedSectionProgressToggle as SectionProgressToggle} from './SectionProgressToggle';
import {ViewType} from './sectionProgressRedux';

export default storybook => {
  function isSummaryTrue() {
    return {
      name:'Summary view toggle on',
      story: () => (
        <SectionProgressToggle
          currentView={ViewType.SUMMARY}
          setCurrentView={() => {console.log("Toggle view.");}}
        />
      )
    };
  }

  function isSummaryFalse() {
    return {
      name:'Detail view toggle on',
      story: () => (
        <SectionProgressToggle
          currentView={ViewType.DETAIL}
          setCurrentView={() => {console.log("Toggle view.");}}
        />
      )
    };
  }

  storybook
    .storiesOf('Progress/SectionProgressToggle', module)
    .addStoryTable([
      isSummaryTrue(),
      isSummaryFalse(),
    ]);
};
