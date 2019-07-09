import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import FreeResponsesAssessmentsTable from '@cdo/apps/templates/sectionAssessments/FreeResponsesAssessmentsTable';
import {questionOne} from '@cdo/apps/templates/sectionAssessments/assessmentsTestHelpers';

describe('FreeResponsesAssessmentsTable', () => {
  it('renders a table', () => {
    const wrapper = mount(
      <FreeResponsesAssessmentsTable freeResponses={questionOne} />
    );

    expect(wrapper.find('table')).to.exist;
  });

  it('renders the correct number of rows and headers', () => {
    const wrapper = mount(
      <FreeResponsesAssessmentsTable freeResponses={questionOne} />
    );

    const tableHeaders = wrapper.find('th');
    expect(tableHeaders).to.have.length(2);

    const tableRows = wrapper.find('tr');
    // Depends on length of the fixture - one row per answer, plus a header row.
    expect(tableRows).to.have.length(questionOne.length + 1);
  });
});
