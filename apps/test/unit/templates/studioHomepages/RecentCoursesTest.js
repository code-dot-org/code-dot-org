import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import { Provider } from 'react-redux';
import { getStore, registerReducers, stubRedux, restoreRedux } from '@cdo/apps/redux';
import isRtlReducer from '@cdo/apps/code-studio/isRtlRedux';
import RecentCourses from '@cdo/apps/templates/studioHomepages/RecentCourses';
import ContentContainer from '@cdo/apps/templates/ContentContainer';
import SetUpCourses from '@cdo/apps/templates/studioHomepages/SetUpCourses';
import Notification from '@cdo/apps/templates/Notification';
import CourseCard from '@cdo/apps/templates/studioHomepages/CourseCard';
import SeeMoreCourses from '@cdo/apps/templates/studioHomepages/SeeMoreCourses';
import TopCourse from '@cdo/apps/templates/studioHomepages/TopCourse';
import { courses, moreCourses, topCourse } from './homepagesTestData';

beforeEach(() => {
  stubRedux();
  registerReducers({isRtl: isRtlReducer});
});

afterEach(() => {
  restoreRedux();
});

describe('RecentCourses', () => {
  it('shows SetUpCourses when there are no courses', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <RecentCourses
          courses={[]}
          topCourse={null}
          isTeacher
        />
      </Provider>
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <ContentContainer
          heading="My Courses"
        >
          <SetUpCourses
            isTeacher
          />
        </ContentContainer>
      </div>
    );
    expect(wrapper.find('TopCourse').exists()).to.be.false;
    expect(wrapper.find('CourseCard').exists()).to.be.false;
    expect(wrapper.find('SeeMoreCourses').exists()).to.be.false;
  });

  it('shows a TopCourse if there is one course', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <RecentCourses
          courses={[]}
          topCourse={topCourse}
          isTeacher
        />
      </Provider>
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <ContentContainer
          heading="My Courses"
        >
          <TopCourse
            assignableName={topCourse.assignableName}
            lessonName={topCourse.lessonName}
            linkToOverview={topCourse.linkToOverview}
            linkToLesson={topCourse.linkToLesson}
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
    expect(wrapper.find('SetUpCourses').exists()).to.be.false;
    expect(wrapper.find('CourseCard').exists()).to.be.false;
    expect(wrapper.find('SeeMoreCourses').exists()).to.be.false;
  });

  it('shows TopCourse and 2 CourseCards when there are 3 courses', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <RecentCourses
          courses={courses}
          topCourse={topCourse}
          isTeacher
        />
      </Provider>
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <ContentContainer
          heading="My Courses"
        >
          <TopCourse
            assignableName={topCourse.assignableName}
            lessonName={topCourse.lessonName}
            linkToOverview={topCourse.linkToOverview}
            linkToLesson={topCourse.linkToLesson}
          />
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

  it('shows TopCourse, 4 CourseCards and a SeeMoreCourses component when there are more than 4 courses', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <RecentCourses
          courses={moreCourses}
          topCourse={topCourse}
          isTeacher
          isRtl={false}
        />
      </Provider>
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <ContentContainer
          heading="My Courses"
        >
          <TopCourse
            assignableName={topCourse.assignableName}
            lessonName={topCourse.lessonName}
            linkToOverview={topCourse.linkToOverview}
            linkToLesson={topCourse.linkToLesson}
          />
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
          <SeeMoreCourses
            courses={moreCourses.slice(4)}
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
    expect(wrapper.find('SetUpCourses').exists()).to.be.false;
  });
});
