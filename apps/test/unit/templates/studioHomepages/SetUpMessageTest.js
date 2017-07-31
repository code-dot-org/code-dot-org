import React from 'react';
import {mount} from 'enzyme';
import {assert} from '../../../util/configuredChai';
import {
  CoursesSetUpMessage,
  SectionsSetUpMessage,
} from '@cdo/apps/templates/studioHomepages/SetUpMessage';

describe('CoursesSetUpMessage', () => {
  it('renders as expected for a teacher', () => {
    const coursesSetUpMessage = mount(
      <CoursesSetUpMessage isRtl={false} isTeacher={true}/>
    );
    assert.equal(coursesSetUpMessage.name(), 'CoursesSetUpMessage');
    assert.equal(coursesSetUpMessage.childAt(0).text(), 'Start learning');
    assert.equal(coursesSetUpMessage.childAt(1).text(), 'Assign a course to your classroom or start your own course.');
    assert.equal(coursesSetUpMessage.childAt(2).name(), 'Button');
    assert.equal(coursesSetUpMessage.childAt(2).props().href, '/courses');
    assert.equal(coursesSetUpMessage.childAt(2).props().text, 'Find a course');
  });
});

describe('SectionsSetUpMessage', () => {
  it('renders as expected for a teacher', () => {
    const sectionsSetUpMessage = mount(
      <SectionsSetUpMessage isRtl={false} codeOrgUrlPrefix="http://localhost:3000/"/>
    );
    assert.equal(sectionsSetUpMessage.name(), 'SectionsSetUpMessage');
    assert.equal(sectionsSetUpMessage.childAt(0).text(), 'Set up your classroom');
    assert.equal(sectionsSetUpMessage.childAt(1).text(), 'Create a new classroom section to start assigning courses and seeing your student progress.');
    assert.equal(sectionsSetUpMessage.childAt(2).name(), 'Button');
    assert.equal(sectionsSetUpMessage.childAt(2).props().href, 'http://localhost:3000//teacher-dashboard#/sections');
    assert.equal(sectionsSetUpMessage.childAt(2).props().text, 'Create section');
  });
});
