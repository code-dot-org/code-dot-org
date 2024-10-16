import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {CSVLink} from 'react-csv';

import {UnconnectedFeedbackDownload as FeedbackDownload} from '@cdo/apps/templates/sectionAssessments/FeedbackDownload';
import i18n from '@cdo/locale';

const DEFAULT_PROPS = {
  sectionName: 'My Section',
  onClickDownload: () => {},
  isCurrentScriptCSD: false,
  scriptName: 'Script Name',
  exportableFeedbackData: [],
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<FeedbackDownload {...props} />);
};

const hasHeader = (headers, headerLabel) => {
  return headers.find(header => header['label'] === headerLabel) !== undefined;
};

describe('FeedbackDownload', () => {
  it('passes rubric headers to CSVLink if isCurrentScriptCSD is true', () => {
    const wrapper = setUp({isCurrentScriptCSD: true});

    const headers = wrapper.find(CSVLink).props().headers;
    expect(hasHeader(headers, i18n.performanceLevel())).toBe(true);
    expect(hasHeader(headers, i18n.performanceLevelDetails())).toBe(true);
  });

  it('does not pass rubric headers to CSVLink if isCurrentScriptCSD is false', () => {
    const wrapper = setUp({isCurrentScriptCSD: false});
    const headers = wrapper.find(CSVLink).props().headers;
    expect(hasHeader(headers, i18n.performanceLevel())).toBe(false);
    expect(hasHeader(headers, i18n.performanceLevelDetails())).toBe(false);
  });

  it('passes review state header to CSVLink', () => {
    const wrapper = setUp();
    const headers = wrapper.find(CSVLink).props().headers;
    expect(hasHeader(headers, i18n.reviewState())).toBe(true);
  });

  it('passes expected file name to CSVLink', () => {
    const wrapper = setUp();
    const fileName = wrapper.find(CSVLink).props().filename;
    expect(fileName.includes('Feedback for My Section in Script Name on')).toBe(
      true
    );
  });
});
