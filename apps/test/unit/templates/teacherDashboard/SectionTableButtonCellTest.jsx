import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import {UnconnectedSectionTableButtonCell as SectionTableButtonCell} from "../../../../src/templates/teacherDashboard/SectionTableButtonCell";

describe('buttons column', () => {
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

  it('shows EditOrDelete by default', () => {
    const wrapper = shallow(
        <SectionTableButtonCell sectionData={section}/>
    );
    assert.equal(wrapper.children().at(0).name(), 'EditOrDelete');
    assert.equal(wrapper.find('EditOrDelete').props().canDelete, false);
    assert.equal(wrapper.children().at(1).name(), 'PrintCertificates');
  });
});
