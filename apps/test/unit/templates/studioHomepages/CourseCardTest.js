import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import CourseCard from '@cdo/apps/templates/studioHomepages/CourseCard';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const testCourse = {
  title: "Course 1",
  description: "Start with Course 1 for early readers. Students will create computer programs that will help them learn to collaborate with others, develop problem-solving skills, and persist through difficult tasks. By the end of this course, students create their very own custom game or story that they can share. Recommended for grades K-1.",
  link: "https://studio.code.org/s/course1",
};

describe('CourseCard', () => {
  it('renders a card-shaped link', () => {
    const wrapper = shallow(
      <CourseCard
        title={testCourse.title}
        description={testCourse.description}
        link={testCourse.link}
        isRtl={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <a href={testCourse.link}>
        <img/>
        <div>
          {testCourse.title}
        </div>
        <div>
          {testCourse.description}
          <div>
            <h3>
              View course
            </h3>
            <FontAwesome icon="chevron-right"/>
          </div>
        </div>
      </a>
    );
  });

  it('can render in RTL mode', () => {
    const wrapper = shallow(
      <CourseCard
        title={testCourse.title}
        description={testCourse.description}
        link={testCourse.link}
        isRtl={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <a href={testCourse.link}>
        <img/>
        <div>
          {testCourse.title}
        </div>
        <div>
          {testCourse.description}
          <div>
            <h3>
              View course
            </h3>
            <FontAwesome icon="chevron-left"/>
          </div>
        </div>
      </a>
    );
  });
});
