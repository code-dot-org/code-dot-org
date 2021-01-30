import React from 'react';
import {mount} from 'enzyme';
import {assert, expect} from '../../../util/reconfiguredChai';
import SubmissionStatusAssessmentsTable from '@cdo/apps/templates/sectionAssessments/SubmissionStatusAssessmentsTable';
import {
  studentOverviewData,
  testDataTimestamps
} from '@cdo/apps/templates/sectionAssessments/assessmentsTestHelpers';
import i18n from '@cdo/locale';

describe('SubmissionStatusAssessmentsTable', () => {
  it('renders a table', () => {
    const wrapper = mount(
      <SubmissionStatusAssessmentsTable
        studentOverviewData={studentOverviewData}
      />
    );

    expect(wrapper.find('table')).to.exist;
  });

  it('renders the correct number of rows and headers', () => {
    const wrapper = mount(
      <SubmissionStatusAssessmentsTable
        studentOverviewData={studentOverviewData}
      />
    );

    const tableHeaders = wrapper.find('th');
    expect(tableHeaders).to.have.length(6);

    const tableRows = wrapper.find('tr');
    expect(tableRows).to.have.length(11);
  });

  it('renders with an icon if specified', () => {
    const wrapper = mount(
      <SubmissionStatusAssessmentsTable
        studentOverviewData={studentOverviewData}
        icon="check-circle"
      />
    );

    const icon = wrapper.find('FontAwesome');
    assert(icon);
  });

  it('renders a checkmark when an assessment is submitted', () => {
    const wrapper = mount(
      <SubmissionStatusAssessmentsTable
        studentOverviewData={studentOverviewData}
      />
    );

    const checkMarkIcons = wrapper.find('.fa-check-circle');
    assert.equal(checkMarkIcons.length, 6);
  });

  it('sorts submissions by date accurately', () => {
    const wrapper = mount(
      <SubmissionStatusAssessmentsTable
        studentOverviewData={studentOverviewData}
      />
    );

    const timeStampCells = wrapper.find('#timestampCell');
    assert.equal(timeStampCells.length, 10);

    const timestampHeaderCell = wrapper.find('#timestampHeaderCell');

    // Sort with oldest first
    timestampHeaderCell.simulate('click');

    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(0)
        .text(),
      i18n.notStarted()
    );
    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(1)
        .text(),
      i18n.notStarted()
    );
    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(2)
        .text(),
      i18n.inProgress()
    );
    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(3)
        .text(),
      i18n.inProgress()
    );
    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(4)
        .text(),
      testDataTimestamps.oldest.toLocaleString()
    );
    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(5)
        .text(),
      testDataTimestamps.older.toLocaleString()
    );
    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(6)
        .text(),
      testDataTimestamps.old.toLocaleString()
    );
    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(7)
        .text(),
      testDataTimestamps.new.toLocaleString()
    );
    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(8)
        .text(),
      testDataTimestamps.newer.toLocaleString()
    );
    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(9)
        .text(),
      testDataTimestamps.newest.toLocaleString()
    );

    //Sort with newest first
    timestampHeaderCell.simulate('click');

    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(9)
        .text(),
      i18n.notStarted()
    );
    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(8)
        .text(),
      i18n.notStarted()
    );
    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(7)
        .text(),
      i18n.inProgress()
    );
    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(6)
        .text(),
      i18n.inProgress()
    );
    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(5)
        .text(),
      testDataTimestamps.oldest.toLocaleString()
    );
    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(4)
        .text(),
      testDataTimestamps.older.toLocaleString()
    );
    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(3)
        .text(),
      testDataTimestamps.old.toLocaleString()
    );
    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(2)
        .text(),
      testDataTimestamps.new.toLocaleString()
    );
    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(1)
        .text(),
      testDataTimestamps.newer.toLocaleString()
    );
    assert.equal(
      wrapper
        .find('#timestampCell')
        .at(0)
        .text(),
      testDataTimestamps.newest.toLocaleString()
    );
  });
});
