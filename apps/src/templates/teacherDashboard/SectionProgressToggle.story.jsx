import React from 'react';
import SectionProgressToggle from './SectionProgressToggle';

export default storybook => {
  function isSummaryTrue() {
    return {
      name:'isSummary view is true',
      story: () => (
        <SectionProgressToggle
          isSummaryView={true}
          toggleView={()=>{console.log("toggle view");}}
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
          toggleView={()=>{console.log("toggle view");}}
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
