import React, { PropTypes } from 'react';
import ContentContainer from '../ContentContainer';
import CourseCard from './CourseCard';
import SetUpCourses from './SetUpCourses';
import SeeMoreCourses from './SeeMoreCourses';
import TopCourse from './TopCourse';
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
    topCourse: shapes.topCourse,
    isRtl: PropTypes.bool.isRequired,
    isTeacher: PropTypes.bool.isRequired
  },

  render() {
    const { courses, topCourse, isTeacher, isRtl } = this.props;
    const topFourCourses = courses.slice(0,4);
    const moreCourses = courses.slice(4);
    const hasCourse = courses.length > 0 || topCourse;

    return (
      <div>
        <ContentContainer
          heading={i18n.myCourses()}
          isRtl={isRtl}
        >
          {topCourse && (
            <TopCourse
              isRtl={isRtl}
              assignableName={topCourse.assignableName}
              lessonName={topCourse.lessonName}
              linkToOverview={topCourse.linkToOverview}
              linkToLesson={topCourse.linkToLesson}
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
                isRtl={isRtl}
              />
            </div>
          )}
          {!hasCourse && (
            <SetUpCourses
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
