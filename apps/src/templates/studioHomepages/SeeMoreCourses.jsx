import React from 'react';
import CourseCard from './CourseCard';
import ContentContainer from './ContentContainer';
import ProgressButton from "../progress/ProgressButton";
import shapes from './shapes';

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
            text="View more"
            style={{float: 'right'}}
          />
        )}
      </div>
    );
  }
});

export default SeeMoreCourses;
