import React from 'react';
import {shallow} from 'enzyme';
import {assert, expect} from '../../../util/configuredChai';
import SeeMoreCourses from '@cdo/apps/templates/studioHomepages/SeeMoreCourses';
import ContentContainer from '@cdo/apps/templates/ContentContainer';
import CourseCard from '@cdo/apps/templates/studioHomepages/CourseCard';
import Button from "@cdo/apps/templates/Button";
import color from '@cdo/apps/util/color';


const courses = [
  {
    title: "Course 1",
    description: "Start with Course 1 for early readers. Students will create computer programs that will help them learn to collaborate with others, develop problem-solving skills, and persist through difficult tasks. By the end of this course, students create their very own custom game or story that they can share. Recommended for grades K-1.",
    link: "https://studio.code.org/s/course1",
  },
  {
    title: "Course 2",
    description: "Start with Course 2 for students who can read and have no prior programming experience. In this course students will create programs to solve problems and develop interactive games or stories they can share. Recommended for grades 2-5.",
    link: "https://studio.code.org/s/course2",
  },
];

describe('SeeMoreCourses', () => {
  it ('shows a button when closed', () => {
    const wrapper = shallow(
      <SeeMoreCourses isRtl={false} courses={courses}/>
    );
    assert(wrapper.containsMatchingElement(
      <Button
        color={Button.ButtonColor.gray}
        icon="caret-down"
        text="View more"
      />
    ));
  });

  it ('shows CourseCards when clicked', () => {
    const wrapper = shallow(
      <SeeMoreCourses isRtl={false} courses={courses}/>
    );
    expect(wrapper.find('Button').exists());
    wrapper.find('Button').simulate('click');
    expect(wrapper.find('Button').exists()).to.be.false;
    assert(wrapper.containsMatchingElement(
      <div>
        <ContentContainer
          heading=""
          linkText=""
          link=""
          showLink={false}
          isRtl={false}
        >
          <div>
            <CourseCard
              title={courses[0].title}
              description={courses[0].description}
              link={courses[0].link}
              isRtl={false}
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
              isRtl={false}
            />
          </div>
        </ContentContainer>
      </div>
    ));
  });
});
