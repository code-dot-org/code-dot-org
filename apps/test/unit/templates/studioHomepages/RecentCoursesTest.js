import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import RecentCourses from '@cdo/apps/templates/studioHomepages/RecentCourses';
import ContentContainer from '@cdo/apps/templates/ContentContainer';
import SetUpCourses from '@cdo/apps/templates/studioHomepages/SetUpCourses';
import Notification from '@cdo/apps/templates/Notification';
import CourseCard from '@cdo/apps/templates/studioHomepages/CourseCard';
import SeeMoreCourses from '@cdo/apps/templates/studioHomepages/SeeMoreCourses';
import { courses, moreCourses } from './homepagesTestData';

describe('RecentCourses', () => {
  describe('as a teacher', () => {
    it('shows SetUpCourses when there are no courses', () => {
      const wrapper = shallow(
        <RecentCourses
          courses={[]}
          isTeacher
          heading="My Courses"
          isRtl={false}
        />
      );
      expect(wrapper).to.containMatchingElement(
        <div>
          <ContentContainer
            heading="My Courses"
            isRtl={false}
          >
            <SetUpCourses
              isRtl={false}
              isTeacher
            />
          </ContentContainer>
        </div>
      );
    });

    it('shows only cards for each course when there are 4 or less courses', () => {
      const wrapper = shallow(
        <RecentCourses
          courses={courses}
          isTeacher
          heading="My Courses"
          isRtl={false}
        />
      );
      expect(wrapper).to.containMatchingElement(
        <div>
          <ContentContainer
            heading="My Courses"
            isRtl={false}
          >
            <div key={0}>
              <CourseCard
                title={courses[0].title}
                description={courses[0].description}
                link={courses[0].link}
                isRtl={false}
              />
              <div>.</div>
            </div>
            <div key={1}>
              <CourseCard
                title={courses[1].title}
                description={courses[1].description}
                link={courses[1].link}
                isRtl={false}
              />
            </div>
            <div>
              <Notification
                type={Notification.NotificationType.course}
                notice="Find a course"
                details="Try new courses to add them to your homepage."
                buttonText="Find a course"
                buttonLink="/courses"
                dismissible={false}
                isRtl={false}
              />
            </div>
          </ContentContainer>
        </div>
      );
    });

    it('shows 4 CourseCards and a SeeMoreCourses component when there are more than 4 courses', () => {
      const wrapper = shallow(
        <RecentCourses
          courses={moreCourses}
          isTeacher
          heading="My Courses"
          isRtl={false}
        />
      );
      expect(wrapper).to.containMatchingElement(
        <div>
          <ContentContainer
            heading="My Courses"
            isRtl={false}
          >
            <div key={0}>
              <CourseCard
                title={moreCourses[0].title}
                description={moreCourses[0].description}
                link={moreCourses[0].link}
                isRtl={false}
              />
              <div>.</div>
            </div>
            <div key={1}>
              <CourseCard
                title={moreCourses[1].title}
                description={moreCourses[1].description}
                link={moreCourses[1].link}
                isRtl={false}
              />
            </div>
            <div key={2}>
              <CourseCard
                title={moreCourses[2].title}
                description={moreCourses[2].description}
                link={moreCourses[2].link}
                isRtl={false}
              />
              <div>.</div>
            </div>
            <div key={3}>
              <CourseCard
                title={moreCourses[3].title}
                description={moreCourses[3].description}
                link={moreCourses[3].link}
                isRtl={false}
              />
            </div>
            <SeeMoreCourses
              courses={moreCourses.slice(4)}
              isRtl={false}
            />
            <div>
              <Notification
                type={Notification.NotificationType.course}
                notice="Find a course"
                details="Try new courses to add them to your homepage."
                buttonText="Find a course"
                buttonLink="/courses"
                dismissible={false}
                isRtl={false}
              />
            </div>
          </ContentContainer>
        </div>
      );
    });
  });
});
