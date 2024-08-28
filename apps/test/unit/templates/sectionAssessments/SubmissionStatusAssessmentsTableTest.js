import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {
  studentOverviewData,
  testDataTimestamps,
} from '@cdo/apps/templates/sectionAssessments/assessmentsTestHelpers';
import SubmissionStatusAssessmentsTable from '@cdo/apps/templates/sectionAssessments/SubmissionStatusAssessmentsTable';
import i18n from '@cdo/locale';

describe('SubmissionStatusAssessmentsTable', () => {
  it('renders a table', () => {
    const wrapper = mount(
      <SubmissionStatusAssessmentsTable
        studentOverviewData={studentOverviewData}
      />
    );

    expect(wrapper.find('table')).toBeDefined();
  });

  it('renders the correct number of rows and headers', () => {
    const wrapper = mount(
      <SubmissionStatusAssessmentsTable
        studentOverviewData={studentOverviewData}
      />
    );

    const tableHeaders = wrapper.find('th');
    expect(tableHeaders).toHaveLength(6);

    const tableRows = wrapper.find('tr');
    expect(tableRows).toHaveLength(11);
  });

  it('renders with an icon if specified', () => {
    const wrapper = mount(
      <SubmissionStatusAssessmentsTable
        studentOverviewData={studentOverviewData}
        icon="check-circle"
      />
    );

    const icon = wrapper.find('FontAwesome');
    expect(icon).toBeTruthy();
  });

  it('renders a checkmark when an assessment is submitted', () => {
    const wrapper = mount(
      <SubmissionStatusAssessmentsTable
        studentOverviewData={studentOverviewData}
      />
    );

    const checkMarkIcons = wrapper.find('.fa-check-circle');
    expect(checkMarkIcons.length).toEqual(6);
  });

  it('sorts submissions by date accurately', () => {
    const wrapper = mount(
      <SubmissionStatusAssessmentsTable
        studentOverviewData={studentOverviewData}
      />
    );

    const timeStampCells = wrapper.find('.timestampCell');
    expect(timeStampCells.length).toEqual(10);

    const timestampHeaderCell = wrapper.find('#timestampHeaderCell');

    // Sort with oldest first
    timestampHeaderCell.simulate('click');

    expect(wrapper.find('.timestampCell').at(0).text()).toEqual(
      i18n.notStarted()
    );
    expect(wrapper.find('.timestampCell').at(1).text()).toEqual(
      i18n.notStarted()
    );
    expect(wrapper.find('.timestampCell').at(2).text()).toEqual(
      i18n.inProgress()
    );
    expect(wrapper.find('.timestampCell').at(3).text()).toEqual(
      i18n.inProgress()
    );
    expect(wrapper.find('.timestampCell').at(4).text()).toEqual(
      testDataTimestamps.oldest.toLocaleString()
    );
    expect(wrapper.find('.timestampCell').at(5).text()).toEqual(
      testDataTimestamps.older.toLocaleString()
    );
    expect(wrapper.find('.timestampCell').at(6).text()).toEqual(
      testDataTimestamps.old.toLocaleString()
    );
    expect(wrapper.find('.timestampCell').at(7).text()).toEqual(
      testDataTimestamps.new.toLocaleString()
    );
    expect(wrapper.find('.timestampCell').at(8).text()).toEqual(
      testDataTimestamps.newer.toLocaleString()
    );
    expect(wrapper.find('.timestampCell').at(9).text()).toEqual(
      testDataTimestamps.newest.toLocaleString()
    );

    //Sort with newest first
    timestampHeaderCell.simulate('click');

    expect(wrapper.find('.timestampCell').at(9).text()).toEqual(
      i18n.notStarted()
    );
    expect(wrapper.find('.timestampCell').at(8).text()).toEqual(
      i18n.notStarted()
    );
    expect(wrapper.find('.timestampCell').at(7).text()).toEqual(
      i18n.inProgress()
    );
    expect(wrapper.find('.timestampCell').at(6).text()).toEqual(
      i18n.inProgress()
    );
    expect(wrapper.find('.timestampCell').at(5).text()).toEqual(
      testDataTimestamps.oldest.toLocaleString()
    );
    expect(wrapper.find('.timestampCell').at(4).text()).toEqual(
      testDataTimestamps.older.toLocaleString()
    );
    expect(wrapper.find('.timestampCell').at(3).text()).toEqual(
      testDataTimestamps.old.toLocaleString()
    );
    expect(wrapper.find('.timestampCell').at(2).text()).toEqual(
      testDataTimestamps.new.toLocaleString()
    );
    expect(wrapper.find('.timestampCell').at(1).text()).toEqual(
      testDataTimestamps.newer.toLocaleString()
    );
    expect(wrapper.find('.timestampCell').at(0).text()).toEqual(
      testDataTimestamps.newest.toLocaleString()
    );
  });

  it('renders submission timestamps', () => {
    const wrapper = mount(
      <SubmissionStatusAssessmentsTable
        studentOverviewData={studentOverviewData}
      />
    );

    // Renders a user-friendly formatted time string
    expect(wrapper.find('.timestampCell').first().text()).toBe(
      '10/7/2018, 8:52:05 PM'
    );

    // Also renders a machine/screen-reader-friendly (Date)Time Element
    expect(wrapper.find('.timestampCell').first().find('time')).toBeDefined();

    expect(
      wrapper.find('.timestampCell').first().find('time').prop('dateTime')
    ).toBe('2018-10-07T20:52:05.000Z');
  });

  // This test is flaky based on the browser version.
  // TODO: Re-enable it once we determine the right browser version/timestamp
  // combination.
  xit('renders localized submission timestamps', () => {
    const basicNonEnglishWrapper = mount(
      <SubmissionStatusAssessmentsTable
        studentOverviewData={studentOverviewData}
        localeCode={'es-MX'}
      />
    );
    expect(basicNonEnglishWrapper.find('.timestampCell').first().text()).toBe(
      '7/10/2018 20:52:05'
    );

    // localeCode will undefined by default here, but it defaults to null in
    // redux; so, make sure we explicitly test that particular falsy value
    const nullLocaleWrapper = mount(
      <SubmissionStatusAssessmentsTable
        studentOverviewData={studentOverviewData}
        localeCode={null}
      />
    );
    expect(nullLocaleWrapper.find('.timestampCell').first().text()).toBe(
      '10/7/2018, 8:52:05 PM'
    );
  });
});
