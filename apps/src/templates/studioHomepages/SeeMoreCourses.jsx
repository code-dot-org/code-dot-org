import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import i18n from '@cdo/locale';

import color from '../../util/color';
import ContentContainer from '../ContentContainer';

import CourseCard from './CourseCard';
import shapes from './shapes';

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
            {courses.map((course, index) => (
              <div key={index}>
                <CourseCard
                  title={course.title}
                  description={course.description}
                  link={course.link}
                  isProfessionalLearningCourse={isProfessionalLearningCourse}
                />
                {index % 2 === 0 && <div style={styles.spacer}>.</div>}
              </div>
            ))}
          </ContentContainer>
        )}
        {!this.state.open && (
          <div style={styles.viewMoreContainer}>
            <Button
              onClick={this.showMoreCourses.bind(this)}
              color={Button.ButtonColor.neutralDark}
              icon="caret-down"
              text={i18n.viewMore()}
              style={styles.button}
              className="ui-test-view-more-courses"
            />
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  viewMoreContainer: {
    display: 'flex',
    justifyContent: 'end',
  },
  spacer: {
    width: 20,
    float: 'left',
    color: color.white,
  },
  button: {
    float: 'right',
    margin: 0,
    marginBottom: 20,
  },
};
