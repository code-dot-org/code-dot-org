import React from 'react';
import ReactDOM from 'react-dom';
import HeaderBanner from '../HeaderBanner';
import RecentCourses from './RecentCourses';
import Sections from './Sections';
import shapes from './shapes';
import i18n from "@cdo/locale";

const StudentHomepage = React.createClass({
  propTypes: {
    courses: shapes.courses,
    sections: shapes.sections,
    isRtl: React.PropTypes.bool.isRequired,
    canLeave: React.PropTypes.bool.isRequired
  },

  componentDidMount() {
    // The component used here is implemented in legacy HAML/CSS rather than React.
    $('#user_hero').appendTo(ReactDOM.findDOMNode(this.refs.userHero)).show();
  },

  render() {
    const { courses, sections, isRtl, canLeave } = this.props;

    return (
      <div>
        <HeaderBanner
          headingText={i18n.homepageHeading()}
          short={true}
        />

        <RecentCourses
          courses={courses}
          showAllCoursesLink={true}
          heading={i18n.myCourses()}
          isRtl={false}
          isTeacher={false}
        />

        <Sections
          sections={sections}
          isRtl={isRtl}
          isTeacher={false}
          canLeave={canLeave}
        />

      </div>
    );
  }
});

export default StudentHomepage;
