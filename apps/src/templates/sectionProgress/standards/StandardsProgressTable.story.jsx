import React from 'react';
import {UnconnectedStandardsProgressTable as StandardsProgressTable} from './StandardsProgressTable';
import {standardsData, lessonCompletedByStandard} from './standardsTestHelpers';
import {combineReducers} from 'redux';
import {Provider} from 'react-redux';
import sectionStandardsProgress from './sectionStandardsProgressRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import {reduxStore} from '@cdo/storybook/decorators';

export default {
  title: 'StandardsProgressTable',
  component: StandardsProgressTable,
};

const Template = args => (
  <Provider
    store={reduxStore(
      combineReducers({
        sectionProgress,
        sectionStandardsProgress,
        unitSelection,
      })
    )}
  >
    <StandardsProgressTable
      standards={standardsData}
      lessonsByStandard={lessonCompletedByStandard}
      {...args}
    />
  </Provider>
);

export const Default = Template.bind({});
