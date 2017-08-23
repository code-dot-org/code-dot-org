import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import { UnconnectedCourseCard as CourseCard } from '@cdo/apps/templates/studioHomepages/CourseCard';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import { courses } from './homepagesTestData';

describe('CourseCard', () => {
  it('renders a card-shaped link', () => {
    const wrapper = shallow(
      <CourseCard
        title={courses[0].title}
        description={courses[0].description}
        link={courses[0].link}
        isRtl={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <a href={courses[0].link}>
        <img/>
        <div>
          {courses[0].title}
        </div>
        <div>
          {courses[0].description}
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
        title={courses[0].title}
        description={courses[0].description}
        link={courses[0].link}
        isRtl={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <a href={courses[0].link}>
        <img/>
        <div>
          {courses[0].title}
        </div>
        <div>
          {courses[0].description}
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
