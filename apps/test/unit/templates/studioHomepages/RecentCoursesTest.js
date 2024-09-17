import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ContentContainer from '@cdo/apps/templates/ContentContainer';
import CourseCard from '@cdo/apps/templates/studioHomepages/CourseCard';
import RecentCourses from '@cdo/apps/templates/studioHomepages/RecentCourses';
import SeeMoreCourses from '@cdo/apps/templates/studioHomepages/SeeMoreCourses';
import SetUpCourses from '@cdo/apps/templates/studioHomepages/SetUpCourses';
import TopCourse from '@cdo/apps/templates/studioHomepages/TopCourse';

import {
  courses,
  moreCourses,
  topPlCourse,
  topCourse,
} from './homepagesTestData';

describe('RecentCourses', () => {
  describe('Student Facing Courses', () => {
    it('shows ViewFeedback when hasFeedback is true', () => {
      const wrapper = shallow(
        <RecentCourses
          courses={[]}
          topCourse={topCourse}
          hasFeedback={true}
          isProfessionalLearningCourse={false}
        />
      );
      expect(wrapper.find('ViewFeedback').length).toEqual(1);
    });

    it('shows ViewFeedback when hasFeedback is false', () => {
      const wrapper = shallow(
        <RecentCourses
          courses={[]}
          topCourse={topCourse}
          hasFeedback={false}
          isProfessionalLearningCourse={false}
        />
      );
      expect(wrapper.find('ViewFeedback').length).toEqual(0);
    });
    it('shows SetUpCourses when there are no courses', () => {
      const wrapper = shallow(
        <RecentCourses courses={[]} topCourse={null} isTeacher />
      );
      expect(
        wrapper.containsMatchingElement(
          <div>
            <ContentContainer heading="My Courses">
              <SetUpCourses isTeacher />
            </ContentContainer>
          </div>
        )
      );
      expect(wrapper.find('TopCourse').exists()).toBe(false);
      expect(wrapper.find('CourseCard').exists()).toBe(false);
      expect(wrapper.find('SeeMoreCourses').exists()).toBe(false);
    });

    it('SetUpCourses has no course when topCourse is null', () => {
      const wrapper = shallow(<RecentCourses topCourse={null} />);
      expect(wrapper.find('SetUpCourses').prop('hasCourse')).toBe(false);
    });

    it('SetUpCourses has no course when topCourse is undefined', () => {
      const wrapper = shallow(<RecentCourses topCourse={undefined} />);
      expect(wrapper.find('SetUpCourses').prop('hasCourse')).toBe(false);
    });

    it('shows a TopCourse if there is one course', () => {
      const wrapper = shallow(
        <RecentCourses courses={[]} topCourse={topCourse} isTeacher />
      );
      expect(
        wrapper.containsMatchingElement(
          <div>
            <ContentContainer heading="My Courses">
              <TopCourse
                assignableName={topCourse.assignableName}
                lessonName={topCourse.lessonName}
                linkToOverview={topCourse.linkToOverview}
                linkToLesson={topCourse.linkToLesson}
              />
              <SetUpCourses isTeacher hasCourse />
            </ContentContainer>
          </div>
        )
      );
      expect(wrapper.find('CourseCard').exists()).toBe(false);
      expect(wrapper.find('SeeMoreCourses').exists()).toBe(false);
    });

    it('shows TopCourse and 2 CourseCards when there are 3 courses', () => {
      const wrapper = shallow(
        <RecentCourses courses={courses} topCourse={topCourse} isTeacher />
      );
      expect(
        wrapper.containsMatchingElement(
          <div>
            <ContentContainer heading="My Courses">
              <TopCourse
                assignableName={topCourse.assignableName}
                lessonName={topCourse.lessonName}
                linkToOverview={topCourse.linkToOverview}
                linkToLesson={topCourse.linkToLesson}
              />
              <div>
                <div key={0}>
                  <CourseCard
                    title={courses[0].title}
                    description={courses[0].description}
                    link={courses[0].link}
                  />
                </div>
                <div key={1}>
                  <CourseCard
                    title={courses[1].title}
                    description={courses[1].description}
                    link={courses[1].link}
                  />
                </div>
              </div>
              <SetUpCourses isTeacher hasCourse />
            </ContentContainer>
          </div>
        )
      );
    });

    it('shows TopCourse, 4 CourseCards and a SeeMoreCourses component when there are more than 4 courses', () => {
      const wrapper = shallow(
        <RecentCourses courses={moreCourses} topCourse={topCourse} isTeacher />
      );
      expect(
        wrapper.containsMatchingElement(
          <div>
            <ContentContainer heading="My Courses">
              <TopCourse
                assignableName={topCourse.assignableName}
                lessonName={topCourse.lessonName}
                linkToOverview={topCourse.linkToOverview}
                linkToLesson={topCourse.linkToLesson}
              />
              <div>
                <div key={0}>
                  <CourseCard
                    title={moreCourses[0].title}
                    description={moreCourses[0].description}
                    link={moreCourses[0].link}
                  />
                </div>
                <div key={1}>
                  <CourseCard
                    title={moreCourses[1].title}
                    description={moreCourses[1].description}
                    link={moreCourses[1].link}
                  />
                </div>
                <div key={2}>
                  <CourseCard
                    title={moreCourses[2].title}
                    description={moreCourses[2].description}
                    link={moreCourses[2].link}
                  />
                </div>
                <div key={3}>
                  <CourseCard
                    title={moreCourses[3].title}
                    description={moreCourses[3].description}
                    link={moreCourses[3].link}
                  />
                </div>
              </div>
              <SeeMoreCourses courses={moreCourses.slice(4)} />
              <SetUpCourses isTeacher hasCourse />
            </ContentContainer>
          </div>
        )
      );
    });
  });

  describe('PL Courses', () => {
    it('does not show SetUpCourses even when no courses with progress', () => {
      const wrapper = shallow(
        <RecentCourses
          courses={[]}
          topCourse={null}
          isProfessionalLearningCourse={true}
        />
      );
      expect(wrapper.find('SetUpCourses').length).toEqual(0);
    });

    it('shows ViewFeedback when hasFeedback is true', () => {
      const wrapper = shallow(
        <RecentCourses
          courses={[]}
          topCourse={topPlCourse}
          hasFeedback={true}
          isProfessionalLearningCourse={true}
        />
      );
      expect(wrapper.find('ViewFeedback').length).toEqual(1);
    });

    it('shows ViewFeedback when hasFeedback is false', () => {
      const wrapper = shallow(
        <RecentCourses
          courses={[]}
          topCourse={topPlCourse}
          hasFeedback={false}
          isProfessionalLearningCourse={true}
        />
      );
      expect(wrapper.find('ViewFeedback').length).toEqual(0);
    });

    it('sets header to professional learning header', () => {
      const wrapper = shallow(
        <RecentCourses
          courses={[]}
          topCourse={topPlCourse}
          isProfessionalLearningCourse={true}
        />
      );
      expect(wrapper.find('Connect(ContentContainer)').props().heading).toEqual(
        'My Professional Learning Courses'
      );
    });
  });
});
