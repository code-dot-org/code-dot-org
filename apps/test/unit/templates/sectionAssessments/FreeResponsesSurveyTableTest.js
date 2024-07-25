import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {
  surveyOne,
  surveyTwo,
} from '@cdo/apps/templates/sectionAssessments/assessmentsTestHelpers';
import FreeResponsesSurveyTable from '@cdo/apps/templates/sectionAssessments/FreeResponsesSurveyTable';

describe('FreeResponsesSurveyTable', () => {
  it('renders a table', () => {
    const wrapper = mount(
      <FreeResponsesSurveyTable freeResponses={surveyTwo} />
    );

    expect(wrapper.find('table')).toBeDefined();
  });

  it('renders the correct number of rows and headers', () => {
    const wrapper = mount(
      <FreeResponsesSurveyTable freeResponses={surveyOne} />
    );

    const tableHeaders = wrapper.find('th');
    expect(tableHeaders).toHaveLength(1);

    const tableRows = wrapper.find('tr');
    // Depends on length of the fixture - one row per answer, plus a header row.
    expect(tableRows).toHaveLength(surveyOne.length + 1);
  });
});
