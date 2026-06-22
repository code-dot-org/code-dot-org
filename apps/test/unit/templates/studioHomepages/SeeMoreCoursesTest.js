import {Button as MuiButton} from '@mui/material';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ContentContainer from '@cdo/apps/templates/ContentContainer';
import CourseCard from '@cdo/apps/templates/studioHomepages/CourseCard';
import SeeMoreCourses from '@cdo/apps/templates/studioHomepages/SeeMoreCourses';

import {courses} from './homepagesTestData';

describe('SeeMoreCourses', () => {
  it('shows a button when closed', () => {
    const wrapper = shallow(<SeeMoreCourses courses={courses} />);
    const button = wrapper.find(MuiButton);
    expect(button.exists()).toBe(true);
    expect(button.prop('children')).toBe('View more');
  });

  it('shows CourseCards when clicked', () => {
    const wrapper = shallow(<SeeMoreCourses courses={courses} />);
    expect(wrapper.find(MuiButton).exists()).toBe(true);
    wrapper.find(MuiButton).simulate('click');
    expect(wrapper.find(MuiButton).exists()).toBe(false);
    expect(
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
                  color: 'transparent',
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
    ).toBeTruthy();
  });

  it('shows PL CourseCards when clicked for PL Recent Courses area', () => {
    const wrapper = shallow(
      <SeeMoreCourses courses={courses} isProfessionalLearningCourse={true} />
    );
    expect(wrapper.find(MuiButton).exists()).toBe(true);
    wrapper.find(MuiButton).simulate('click');
    expect(wrapper.find(MuiButton).exists()).toBe(false);
    expect(
      wrapper.containsMatchingElement(
        <div>
          <ContentContainer heading="" linkText="" link="" showLink={false}>
            <div>
              <CourseCard
                title={courses[0].title}
                description={courses[0].description}
                link={courses[0].link}
                isProfessionalLearningCourse={true}
              />
              <div
                style={{
                  width: 20,
                  float: 'left',
                  color: 'transparent',
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
                isProfessionalLearningCourse={true}
              />
            </div>
          </ContentContainer>
        </div>
      )
    ).toBeTruthy();
  });
});
