import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import i18n from '@cdo/locale';

import ContentContainer from '../ContentContainer';

import CourseCard from './CourseCard';
import shapes from './shapes';

import styles from './see-more-courses.module.scss';

// This component - used on the teacher and student homepages -
// shows a button to view more courses if the user has more than a few courses.
// Students and teachers will see up to 5 courses, with their most recent as a
// TopCourse, and the button if they have more. Clicking the button will
// show CoursesCards for all of the users' courses beyond the top 5.

export default class SeeMoreCourses extends Component {
  static propTypes = {
    courses: shapes.courses,
    isProfessionalLearningCourse: PropTypes.bool,
  };

  state = {
    open: false,
  };

  showMoreCourses() {
    this.setState({open: true});
  }

  render() {
    const {courses, isProfessionalLearningCourse} = this.props;

    return (
      <div>
        {this.state.open && courses && (
          <ContentContainer heading="" linkText="" link="" showLink={false}>
            <div className={styles.courseCards}>
              {courses.map((course, index) => (
                <CourseCard
                  key={index}
                  title={course.title}
                  description={course.description}
                  link={course.link}
                  isProfessionalLearningCourse={isProfessionalLearningCourse}
                />
              ))}
            </div>
          </ContentContainer>
        )}
        {!this.state.open && (
          <div className={styles.viewMoreContainer}>
            <MuiButton
              onClick={this.showMoreCourses.bind(this)}
              variant="outlined"
              color="tertiary"
              size="small"
              startIcon={<i className="fa fa-caret-down" />}
              className={`${styles.button} ui-test-view-more-courses`}
            >
              {i18n.viewMore()}
            </MuiButton>
          </div>
        )}
      </div>
    );
  }
}
