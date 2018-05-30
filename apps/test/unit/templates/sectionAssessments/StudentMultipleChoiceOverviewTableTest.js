import React from 'react';
import {mount} from 'enzyme';
import {assert, expect} from '../../../util/configuredChai';
import StudentMultipleChoiceOverviewTable from '@cdo/apps/templates/sectionAssessments/StudentMultipleChoiceOverviewTable';
import {studentOverviewData} from '@cdo/apps/templates/sectionAssessments/assessmentsTestHelpers';

describe('StudentMultipleChoiceOverviewTable', () => {
  it('renders a table', () => {
    const wrapper = mount(
      <StudentMultipleChoiceOverviewTable
        studentOverviewData={studentOverviewData}
      />
    );

    expect(wrapper.find('table')).to.exist;
  });

  it('renders the correct number of rows and headers', () => {
    const wrapper = mount(
      <StudentMultipleChoiceOverviewTable
        studentOverviewData={studentOverviewData}
      />
    );

    const tableHeaders = wrapper.find('th');
    expect(tableHeaders).to.have.length(5);

    const tableRows = wrapper.find('tr');
    expect(tableRows).to.have.length(7);
  });

  it('displays a check mark icon if specified', () => {
    const wrapper = mount(
      <StudentMultipleChoiceOverviewTable
        studentOverviewData={studentOverviewData}
      />
    );

    expect(wrapper.find('#checkmark').exists()).to.be.true;
  });

  it('renders a checkmark when an assessment is submitted', () => {
    const wrapper = mount(
      <StudentMultipleChoiceOverviewTable
        studentOverviewData={studentOverviewData}
        isSubmitted={true}
      />
    );

    const checkMarkIcons = wrapper.find('#checkmark');
    assert.equal(checkMarkIcons.length, 4);
  });
});
