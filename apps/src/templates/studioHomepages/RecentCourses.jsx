import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ContentContainer from '../ContentContainer';
import CourseCard from './CourseCard';
import SetUpCourses from './SetUpCourses';
import SeeMoreCourses from './SeeMoreCourses';
import TopCourse from './TopCourse';
import styleConstants from '../../styleConstants';
import i18n from '@cdo/locale';
import shapes from './shapes';

const contentWidth = styleConstants['content-width'];

const styles = {
  container: {
    width: contentWidth,
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  }
};

export default class RecentCourses extends Component {
  static propTypes = {
    courses: shapes.courses,
    topCourse: shapes.topCourse,
    isTeacher: PropTypes.bool.isRequired
  };

  render() {
    const {courses, topCourse, isTeacher} = this.props;
    const topFourCourses = courses.slice(0, 4);
    const moreCourses = courses.slice(4);
    const hasCourse = courses.length > 0 || topCourse !== null;

    return (
      <div id="recent-courses">
        <ContentContainer heading={i18n.myCourses()}>
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
              {topFourCourses.map((course, index) => (
                <div key={index}>
                  <CourseCard
                    title={course.title}
                    description={course.description}
                    link={course.link}
                  />
                </div>
              ))}
            </div>
          )}
          {moreCourses.length > 0 && <SeeMoreCourses courses={moreCourses} />}
          <SetUpCourses isTeacher={isTeacher} hasCourse={hasCourse} />
        </ContentContainer>
      </div>
    );
  }
}
