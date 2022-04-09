import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {sections} from './fakeSectionUtils';
import StudentSections from '@cdo/apps/templates/studioHomepages/StudentSections';
import SectionsAsStudentTable from '@cdo/apps/templates/studioHomepages/SectionsAsStudentTable';
import sinon from 'sinon';

describe('StudentSections', () => {
  let defaultProps, updateSections, updateSectionsResult;
  beforeEach(() => {
    updateSectionsResult = sinon.spy();
    updateSections = sinon.spy();
    defaultProps = {
      sections: [],
      isTeacher: false,
      isPlSections: false,
      updateSectionsResult,
      updateSections
    };
  });

  it('does not render a SectionsAsStudentTable when not enrolled in any sections', () => {
    const wrapper = shallow(
      <StudentSections {...defaultProps} sections={[]} />
    );
    expect(wrapper.find(SectionsAsStudentTable).length).to.equal(0);
  });

  it('renders a SectionsAsStudentTable when enrolled in one or more sections', () => {
    const wrapper = shallow(
      <StudentSections {...defaultProps} sections={sections} />
    );
    expect(wrapper.find(SectionsAsStudentTable).length).to.equal(1);
  });
});
