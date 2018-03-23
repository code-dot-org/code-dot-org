import React from 'react';
import SectionProgressToggle from './SectionProgressToggle';

export default storybook => {
  function isSummaryTrue() {
    return {
      name:'isSummary view is true',
      story: () => (
        <SectionProgressToggle
          isSummaryView={true}
        />
      )
    };
  }

  function isSummaryFalse() {
    return {
      name:'isSummary view is false',
      story: () => (
        <SectionProgressToggle
          isSummaryView={false}
        />
      )
    };
  }

  storybook
    .storiesOf('TeacherDashboard/SectionProgressToggle', module)
    .addStoryTable([
      isSummaryTrue(),
      isSummaryFalse(),
    ]);
};
