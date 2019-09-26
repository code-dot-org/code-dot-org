import React from 'react';
import SurveyRollupTable from '../../components/survey_results/survey_rollup_table';
import reactBootstrapStoryDecorator from '../../../reactBootstrapStoryDecorator';

export default storybook => {
  storybook
    .storiesOf('SurveyRollupTable', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'Survey Rollup Table',
        story: () => <SurveyRollupTable data={{}} />
      }
    ]);
};
