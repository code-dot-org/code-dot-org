import React from 'react';
import {mount} from 'enzyme';
import {assert} from '../../../util/configuredChai';
import {
  CoursesSetUpMessage,
  SectionsSetUpMessage,
} from '@cdo/apps/templates/studioHomepages/SetUpMessage';
import Button from "@cdo/apps/templates/Button";

describe('CoursesSetUpMessage', () => {
  it('renders as expected for a teacher', () => {
    const wrapper = mount(
      <CoursesSetUpMessage isRtl={false} isTeacher={true}/>
    );
    assert(wrapper.containsMatchingElement(
      <div>
        <div>
          Start learning
        </div>
        <div>
          Assign a course to your classroom or start your own course.
        </div>
        <Button
          href={'/courses'}
          color={Button.ButtonColor.gray}
          text={'Find a course'}
        />
      </div>
    ));
  });

  it('renders as expected for a student', () => {
    const wrapper = mount(
      <CoursesSetUpMessage isRtl={false} isTeacher={false}/>
    );
    assert(wrapper.containsMatchingElement(
      <div>
        <div>
          Start learning
        </div>
        <div>
          Browse Code.org's courses to find your next challenge.
        </div>
        <Button
          href={'/courses'}
          color={Button.ButtonColor.gray}
          text={'Find a course'}
        />
      </div>
    ));
  });
});

describe('SectionsSetUpMessage', () => {
  it('renders as expected for a teacher', () => {
    const wrapper = mount(
      <SectionsSetUpMessage isRtl={false} codeOrgUrlPrefix="http://localhost:3000/"/>
    );
    assert(wrapper.containsMatchingElement(
      <div>
        <div>
          Set up your classroom
        </div>
        <div>
          Create a new classroom section to start assigning courses and seeing your student progress.
        </div>
        <Button
          href={'http://localhost:3000//teacher-dashboard#/sections'}
          color={Button.ButtonColor.gray}
          text={'Create section'}
        />
      </div>
    ));
  });
});
