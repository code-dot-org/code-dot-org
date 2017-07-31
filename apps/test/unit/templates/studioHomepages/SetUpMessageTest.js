import React from 'react';
import {mount} from 'enzyme';
import {assert} from '../../../util/configuredChai';
import {
  CoursesSetUpMessage,
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
