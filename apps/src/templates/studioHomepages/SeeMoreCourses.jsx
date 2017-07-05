import React from 'react';
import i18n from "@cdo/locale";
import CourseCard from './CourseCard';
import ContentContainer from '../ContentContainer';
import ProgressButton from "../progress/ProgressButton";
import shapes from './shapes';

// This component - used on the teacher and student homepages - shows a button to view more courses if the user has more than a few courses.  Teachers will see up to 4 courses and a button if they have more. Students will see up to 5 courses, with their most recent as a TopCourse, and the button if they have more. Clicking the button will show CoursesCards for all of the users' courses beyond the top 4 or 5.

const SeeMoreCourses = React.createClass({
  propTypes: {
    courses: shapes.courses,
    isRtl: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return { open: false };
  },

  showMoreCourses(){
    this.setState({ open: true });
  },

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
              <CourseCard
                key={index}
                name={course.name}
                description={course.description}
                link={course.link}
                isRtl={isRtl}
              />
            )}
          </ContentContainer>
        )}
        {!this.state.open && (
          <ProgressButton
            onClick={this.showMoreCourses}
            color={ProgressButton.ButtonColor.gray}
            icon="caret-down"
            text={i18n.viewMore()}
            style={{float: 'right'}}
          />
        )}
      </div>
    );
  }
});

export default SeeMoreCourses;
