import React from 'react';
import CourseCard from './CourseCard';
import ContentContainer from './ContentContainer';
import ProgressButton from "../progress/ProgressButton";
import shapes from './shapes';

const SeeMoreCourses = React.creatClass({
  propTypes: {
    courses: shapes.courses,
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
        {this.state.open && (
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
            icon="down-caret"
            text="View more"
            style={{marginRight: 20}}
          />
        )}
      </div>
    );
  }
});

export default SeeMoreCourses;
