import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ContentContainer from '../ContentContainer';
import CourseCard from './CourseCard';
import SetUpCourses from './SetUpCourses';
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
    isTeacher: PropTypes.bool.isRequired,
    isRtl: React.PropTypes.bool.isRequired,
    studentTopCourse: shapes.studentTopCourse
  },

  render() {
    const { courses, isTeacher, studentTopCourse } = this.props;
    const topFourCourses = courses.slice(0,4);
    const moreCourses = courses.slice(4);
    const hasCourse = courses.length > 0 || studentTopCourse;

    return (
      <div>
        <ContentContainer
          heading={i18n.myCourses()}
        >
          {!isTeacher && studentTopCourse && (
            <StudentTopCourse
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
              />
              {(index % 2 === 0) && <div style={styles.spacer}>.</div>}
            </div>
            )
          )}
          {moreCourses.length > 0 && (
            <SeeMoreCourses
              courses={moreCourses}
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
            <SetUpCourses
              isTeacher={isTeacher}
            />
          )}
        </ContentContainer>
      </div>
    );
  }
});

export default connect(state => ({
  isRtl: state.isRtl
}))(RecentCourses);
