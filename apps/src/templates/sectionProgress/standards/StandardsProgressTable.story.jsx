import React from 'react';
import {Provider} from 'react-redux';
import {combineReducers} from 'redux';

import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {reduxStore} from '@cdo/storybook/decorators';

import sectionStandardsProgress from './sectionStandardsProgressRedux';
import {UnconnectedStandardsProgressTable as StandardsProgressTable} from './StandardsProgressTable';
import {standardsData, lessonCompletedByStandard} from './standardsTestHelpers';

export default {
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
