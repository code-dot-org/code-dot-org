import React from 'react';
import ReactDOM from 'react-dom';
import HeaderBanner from '../HeaderBanner';
import RecentCourses from './RecentCourses';
<<<<<<< HEAD
=======
import Sections from './Sections';
import StudentResources from './StudentResources';
>>>>>>> 5d2878fb8d... Pass canLeave from StudentHomepage to SectionsTable
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
<<<<<<< HEAD
          heading={i18n.myCourses()}
          isRtl={false}
          isTeacher={false}
=======
          header={i18n.recentCourses()}
          isRtl={isRtl}
        />

        <Sections
          sections={sections}
          isRtl={isRtl}
          isTeacher={false}
          canLeave={canLeave}
>>>>>>> 5d2878fb8d... Pass canLeave from StudentHomepage to SectionsTable
        />

      </div>
    );
  }
});

export default StudentHomepage;
