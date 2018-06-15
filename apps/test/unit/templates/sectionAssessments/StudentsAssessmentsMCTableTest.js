import React from 'react';
import {mount} from 'enzyme';
import {assert, expect} from '../../../util/configuredChai';
import StudentsAssessmentsMCTable from '@cdo/apps/templates/sectionAssessments/StudentsAssessmentsMCTable';
import {studentOverviewData} from '@cdo/apps/templates/sectionAssessments/assessmentsTestHelpers';

describe('StudentsAssessmentsMCTable', () => {
  it('renders a table', () => {
    const wrapper = mount(
      <StudentsAssessmentsMCTable
        studentOverviewData={studentOverviewData}
      />
    );

    expect(wrapper.find('table')).to.exist;
  });

  it('renders the correct number of rows and headers', () => {
    const wrapper = mount(
      <StudentsAssessmentsMCTable
        studentOverviewData={studentOverviewData}
      />
    );

    const tableHeaders = wrapper.find('th');
    expect(tableHeaders).to.have.length(4);

    const tableRows = wrapper.find('tr');
    expect(tableRows).to.have.length(7);
  });

  it('renders with an icon if specified', () => {
    const wrapper = mount(
      <StudentsAssessmentsMCTable
        studentOverviewData={studentOverviewData}
        icon="check-circle"
      />
  );

    const icon = wrapper.find('FontAwesome');
    assert(icon);
  });

  it('renders a checkmark when an assessment is submitted', () => {
    const wrapper = mount(
      <StudentsAssessmentsMCTable
        studentOverviewData={studentOverviewData}
      />
    );

    const checkMarkIcons = wrapper.find('#checkmark');
    assert.equal(checkMarkIcons.length, 0);
  });
});
