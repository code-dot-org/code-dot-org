import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import {
  UnconnectedSectionTableButtonCell as SectionTableButtonCell,
} from '@cdo/apps/templates/teacherDashboard/SectionTableButtonCell';

describe('SectionTableButtonCell', () => {
  const section = {
    id: 1,
    name: 'sectionA',
    studentCount: 3,
    code: 'ABC',
    courseId: 29,
    scriptId: 168,
    grade: '5',
    providerManaged: false,
    assignmentName: ['CS Discoveries', 'Unit 1: Problem Solving'],
    assignmentPaths: ['//localhost-studio.code.org:3000/courses/csd', '//localhost-studio.code.org:3000/s/csd1']
  };

  it('shows an edit button', () => {
    const wrapper = shallow(
      <SectionTableButtonCell sectionData={section}/>
    );
    assert.equal(wrapper.find('Button').length, 1);
    assert.equal(wrapper.find('Button').props().text, 'Edit');
  });

  it('shows PrintCertificates button', () => {
    const wrapper = shallow(
      <SectionTableButtonCell sectionData={section}/>
    );
    assert.equal(wrapper.find('PrintCertificates').length, 1);
  });

  it('does not show DeleteAndConfirm when section has students', () => {
    const wrapper = shallow(
      <SectionTableButtonCell sectionData={section}/>
    );
    assert.equal(wrapper.find('DeleteAndConfirm').length, 0);
  });

  it('does show DeleteAndConfirm when section has 0 students', () => {
    const wrapper = shallow(
      <SectionTableButtonCell
        sectionData={{
          ...section,
          studentCount: 0
        }}
      />
    );
    assert.equal(wrapper.find('DeleteAndConfirm').length, 1);
  });
});
