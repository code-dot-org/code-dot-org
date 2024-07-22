import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {questionOne} from '@cdo/apps/templates/sectionAssessments/assessmentsTestHelpers';
import FreeResponsesAssessmentsTable from '@cdo/apps/templates/sectionAssessments/FreeResponsesAssessmentsTable';

describe('FreeResponsesAssessmentsTable', () => {
  it('renders a table', () => {
    const wrapper = mount(
      <FreeResponsesAssessmentsTable freeResponses={questionOne} />
    );

    expect(wrapper.find('table')).toBeDefined();
  });

  it('renders the correct number of rows and headers', () => {
    const wrapper = mount(
      <FreeResponsesAssessmentsTable freeResponses={questionOne} />
    );

    const tableHeaders = wrapper.find('th');
    expect(tableHeaders).toHaveLength(2);

    const tableRows = wrapper.find('tr');
    // Depends on length of the fixture - one row per answer, plus a header row.
    expect(tableRows).toHaveLength(questionOne.length + 1);
  });
});
