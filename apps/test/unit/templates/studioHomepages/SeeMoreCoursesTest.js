import {Button as MuiButton} from '@mui/material';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

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
    const courseCards = wrapper.find(CourseCard);
    expect(courseCards).toHaveLength(courses.length);
    expect(courseCards.at(0).props()).toMatchObject({
      title: courses[0].title,
      description: courses[0].description,
      link: courses[0].link,
    });
  });

  it('shows PL CourseCards when clicked for PL Recent Courses area', () => {
    const wrapper = shallow(
      <SeeMoreCourses courses={courses} isProfessionalLearningCourse={true} />
    );
    expect(wrapper.find(MuiButton).exists()).toBe(true);
    wrapper.find(MuiButton).simulate('click');
    expect(wrapper.find(MuiButton).exists()).toBe(false);
    const courseCards = wrapper.find(CourseCard);
    expect(courseCards).toHaveLength(courses.length);
    expect(courseCards.at(0).props()).toMatchObject({
      title: courses[0].title,
      description: courses[0].description,
      link: courses[0].link,
      isProfessionalLearningCourse: true,
    });
  });
});
