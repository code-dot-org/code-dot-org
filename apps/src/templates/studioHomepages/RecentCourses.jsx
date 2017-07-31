import React, { PropTypes } from 'react';
import ContentContainer from '../ContentContainer';
import CourseCard from './CourseCard';
import {CoursesSetUpMessage} from './SetUpMessage';
import SeeMoreCourses from './SeeMoreCourses';
import StudentTopCourse from './StudentTopCourse';
import Notification from '@cdo/apps/templates/Notification';
import i18n from "@cdo/locale";
import shapes from './shapes';
import color from "../../util/color";

const styles = {
  spacer: {
    width: 20,
    float: 'left',
    color: color.white
  }
};

const RecentCourses = React.createClass({
  propTypes: {
    courses: shapes.courses,
    showAllCoursesLink: PropTypes.bool.isRequired,
    isTeacher: PropTypes.bool.isRequired,
    heading: PropTypes.string.isRequired,
    isRtl: React.PropTypes.bool.isRequired,
    studentTopCourse: shapes.studentTopCourse
  },

  render() {
    const { courses, showAllCoursesLink, isTeacher, heading, isRtl, studentTopCourse } = this.props;
    const topFourCourses = courses.slice(0,4);
    const moreCourses = courses.slice(4);
    const hasCourse = courses.length > 0 || studentTopCourse;

    return (
      <div>
        <ContentContainer
          heading={heading}
          linkText={i18n.findCourse()}
          link="/courses"
          showLink={showAllCoursesLink}
          isRtl={isRtl}
        >
          {!isTeacher && studentTopCourse && (
            <StudentTopCourse
              isRtl={isRtl}
              assignableName={studentTopCourse.assignableName}
              lessonName={studentTopCourse.lessonName}
              linkToOverview={studentTopCourse.linkToOverview}
              linkToLesson={studentTopCourse.linkToLesson}
            />
          )}
          {topFourCourses.length > 0 && (
            topFourCourses.map((course, index) =>
            <div key={index}>
              <CourseCard
                title={course.title}
                description={course.description}
                link={course.link}
                isRtl={isRtl}
              />
              {(index % 2 === 0) && <div style={styles.spacer}>.</div>}
            </div>
            )
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
                type={Notification.NotificationType.course}
                notice={i18n.findCourse()}
                details={i18n.findCourseDescription()}
                buttonText={i18n.findCourse()}
                buttonLink="/courses"
                dismissible={false}
              />
            </div>
          )}
          {!hasCourse && (
            <CoursesSetUpMessage
              isRtl={isRtl}
              isTeacher={isTeacher}
            />
          )}
        </ContentContainer>
      </div>
    );
  }
});

export default RecentCourses;
