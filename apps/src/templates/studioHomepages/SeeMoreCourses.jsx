import React, { PropTypes, Component } from 'react';
import i18n from "@cdo/locale";
import CourseCard from './CourseCard';
import ContentContainer from '../ContentContainer';
import Button from "../Button";
import shapes from './shapes';
import color from "../../util/color";

const styles = {
  spacer: {
    width: 20,
    float: 'left',
    color: color.white
  },
  button: {
    float: 'right',
    marginBottom: 20
  }
};

// This component - used on the teacher and student homepages - shows a button to view more courses if the user has more than a few courses. Students and teachers will see up to 5 courses, with their most recent as a TopCourse, and the button if they have more. Clicking the button will show CoursesCards for all of the users' courses beyond the top 5.

export default class SeeMoreCourses extends Component {
  static propTypes = {
    courses: shapes.courses,
    isRtl: PropTypes.bool.isRequired
  };

  state = {
    open: false
  };

  showMoreCourses() {
    this.setState({ open: true });
  }

  render() {
    const { courses, isRtl } = this.props;

    return (
      <div>
        {this.state.open && courses && (
          <ContentContainer
            heading=""
            linkText=""
            link=""
            showLink={false}
            isRtl={isRtl}
          >
            {courses.map((course, index) =>
              <div key={index}>
                <CourseCard
                  title={course.title}
                  description={course.description}
                  link={course.link}
                />
                {(index % 2 === 0) && <div style={styles.spacer}>.</div>}
              </div>
            )}
          </ContentContainer>
        )}
        {!this.state.open && (
          <Button
            onClick={this.showMoreCourses.bind(this)}
            color={Button.ButtonColor.gray}
            icon="caret-down"
            text={i18n.viewMore()}
            style={styles.button}
          />
        )}
      </div>
    );
  }
}
