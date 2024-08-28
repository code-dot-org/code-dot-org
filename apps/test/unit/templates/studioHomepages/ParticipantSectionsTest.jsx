import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ParticipantSections from '@cdo/apps/templates/studioHomepages/ParticipantSections';
import SectionsAsStudentTable from '@cdo/apps/templates/studioHomepages/SectionsAsStudentTable';

import {sections} from './fakeSectionUtils';

describe('ParticipantSections', () => {
  let defaultProps, updateSections, updateSectionsResult;
  beforeEach(() => {
    updateSectionsResult = jest.fn();
    updateSections = jest.fn();
    defaultProps = {
      sections: [],
      isTeacher: false,
      isPlSections: false,
      updateSectionsResult,
      updateSections,
    };
  });

  it('does not render a SectionsAsStudentTable when not enrolled in any sections', () => {
    const wrapper = shallow(
      <ParticipantSections {...defaultProps} sections={[]} />
    );
    expect(wrapper.find(SectionsAsStudentTable).length).toBe(0);
  });

  it('renders a SectionsAsStudentTable when enrolled in one or more sections', () => {
    const wrapper = shallow(
      <ParticipantSections {...defaultProps} sections={sections} />
    );
    expect(wrapper.find(SectionsAsStudentTable).length).toBe(1);
  });
});
