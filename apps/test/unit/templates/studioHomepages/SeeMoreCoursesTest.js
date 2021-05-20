import React from 'react';
import {shallow} from 'enzyme';
import {assert, expect} from '../../../util/deprecatedChai';
import SeeMoreCourses from '@cdo/apps/templates/studioHomepages/SeeMoreCourses';
import ContentContainer from '@cdo/apps/templates/ContentContainer';
import CourseCard from '@cdo/apps/templates/studioHomepages/CourseCard';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import {courses} from './homepagesTestData';

describe('SeeMoreCourses', () => {
  it('shows a button when closed', () => {
    const wrapper = shallow(<SeeMoreCourses courses={courses} />);
    assert(
      wrapper.containsMatchingElement(
        <Button
          __useDeprecatedTag
          color={Button.ButtonColor.gray}
          icon="caret-down"
          text="View more"
        />
      )
    );
  });

  it('shows CourseCards when clicked', () => {
    const wrapper = shallow(<SeeMoreCourses courses={courses} />);
    expect(wrapper.find('Button').exists());
    wrapper.find('Button').simulate('click');
    expect(wrapper.find('Button').exists()).to.be.false;
    assert(
      wrapper.containsMatchingElement(
        <div>
          <ContentContainer heading="" linkText="" link="" showLink={false}>
            <div>
              <CourseCard
                title={courses[0].title}
                description={courses[0].description}
                link={courses[0].link}
              />
              <div
                style={{
                  width: 20,
                  float: 'left',
                  color: color.white
                }}
              >
                .
              </div>
            </div>
            <div>
              <CourseCard
                title={courses[1].title}
                description={courses[1].description}
                link={courses[1].link}
              />
            </div>
          </ContentContainer>
        </div>
      )
    );
  });
});
