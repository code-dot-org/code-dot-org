import React from 'react';
import SectionProgressToggle from './SectionProgressToggle';

export default storybook => {
  function isSummaryTrue() {
    return {
      name:'Summary view toggle on',
      story: () => (
        <SectionProgressToggle
          isSummaryView={true}
          toggleView={() => {console.log("Toggle view.");}}
        />
      )
    };
  }

  function isSummaryFalse() {
    return {
      name:'Detail view toggle on',
      story: () => (
        <SectionProgressToggle
          isSummaryView={false}
          toggleView={() => {console.log("Toggle view.");}}
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
