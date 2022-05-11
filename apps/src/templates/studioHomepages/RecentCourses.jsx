import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ContentContainer from '../ContentContainer';
import CourseCard from './CourseCard';
import SetUpCourses from './SetUpCourses';
import SeeMoreCourses from './SeeMoreCourses';
import TopCourse from './TopCourse';
import ViewFeedback from './ViewFeedback';
import styleConstants from '../../styleConstants';
import i18n from '@cdo/locale';
import shapes from './shapes';

const contentWidth = styleConstants['content-width'];

export default class RecentCourses extends Component {
  static propTypes = {
    courses: shapes.courses,
    topCourse: shapes.topCourse,
    isTeacher: PropTypes.bool.isRequired,
    hasFeedback: PropTypes.bool.isRequired,
    isProfessionalLearningCourse: PropTypes.bool
  };

  static defaultProps = {
    courses: [],
    isTeacher: false,
    hasFeedback: false
  };

  render() {
    const {
      courses,
      topCourse,
      isTeacher,
      hasFeedback,
      isProfessionalLearningCourse
    } = this.props;
    const topFourCourses = courses.slice(0, 4);
    const moreCourses = courses.slice(4);
    const hasCourse = courses.length > 0 || !!topCourse;

    return (
      <div id="recent-courses">
        <ContentContainer
          heading={
            isProfessionalLearningCourse
              ? i18n.myProfessionalLearningCourses()
              : i18n.myCourses()
          }
        >
          {topCourse && (
            <TopCourse
              assignableName={topCourse.assignableName}
              lessonName={topCourse.lessonName}
              linkToOverview={topCourse.linkToOverview}
              linkToLesson={topCourse.linkToLesson}
              isProfessionalLearningCourse={isProfessionalLearningCourse}
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
                    isProfessionalLearningCourse={isProfessionalLearningCourse}
                  />
                </div>
              ))}
            </div>
          )}
          {moreCourses.length > 0 && (
            <SeeMoreCourses
              courses={moreCourses}
              isProfessionalLearningCourse={isProfessionalLearningCourse}
            />
          )}
          {/* TODO(dmcavoy): Participants in PL courses should be able to get feedback*/}
          {!isTeacher && hasFeedback && !isProfessionalLearningCourse && (
            <ViewFeedback />
          )}
          {!isProfessionalLearningCourse && (
            <SetUpCourses isTeacher={isTeacher} hasCourse={hasCourse} />
          )}
        </ContentContainer>
      </div>
    );
  }
}

const styles = {
  container: {
    width: contentWidth,
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  }
};
