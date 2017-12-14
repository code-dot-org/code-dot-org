import React, { PropTypes, Component } from 'react';
import ContentContainer from '../ContentContainer';
import CourseCard from './CourseCard';
import SetUpCourses from './SetUpCourses';
import SeeMoreCourses from './SeeMoreCourses';
import TopCourse from './TopCourse';
import Notification, { NotificationType } from '@cdo/apps/templates/Notification';
import styleConstants from '../../styleConstants';
import i18n from "@cdo/locale";
import shapes from './shapes';

const contentWidth = styleConstants['content-width'];

const styles = {
  container: {
    width: contentWidth,
    display: "flex",
    justifyContent: "space-between",
    flexWrap: 'wrap'
  },
};

export default class RecentCourses extends Component {
  static propTypes = {
    courses: shapes.courses,
    topCourse: shapes.topCourse,
    isRtl: PropTypes.bool.isRequired,
    isTeacher: PropTypes.bool.isRequired
  };

  render() {
    const { courses, topCourse, isTeacher, isRtl } = this.props;
    const topFourCourses = courses.slice(0,4);
    const moreCourses = courses.slice(4);
    const hasCourse = courses.length > 0 || topCourse;

    return (
      <div id="recent-courses">
        <ContentContainer
          heading={i18n.myCourses()}
          isRtl={isRtl}
        >
          {topCourse && (
            <TopCourse
              assignableName={topCourse.assignableName}
              lessonName={topCourse.lessonName}
              linkToOverview={topCourse.linkToOverview}
              linkToLesson={topCourse.linkToLesson}
            />
          )}
          {topFourCourses.length > 0 && (
            <div style={styles.container}>
              {topFourCourses.map((course, index) =>
                <div key={index}>
                  <CourseCard
                    title={course.title}
                    description={course.description}
                    link={course.link}
                  />
                </div>
              )}
            </div>
          )}
          {moreCourses.length > 0 && (
            <SeeMoreCourses
              courses={moreCourses}
              isRtl={isRtl}
            />
          )}
          {hasCourse && (
            <div>
              <Notification
                type={NotificationType.course}
                notice={i18n.findCourse()}
                details={i18n.findCourseDescription()}
                buttonText={i18n.findCourse()}
                buttonLink="/courses"
                dismissible={false}
              />
            </div>
          )}
          {!hasCourse && (
            <SetUpCourses
              isTeacher={isTeacher}
            />
          )}
        </ContentContainer>
      </div>
    );
  }
}
