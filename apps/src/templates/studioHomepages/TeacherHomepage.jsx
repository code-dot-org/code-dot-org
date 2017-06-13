import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import HeaderBanner from '../HeaderBanner';
import Announcements from './Announcements';
import RecentCourses from './RecentCourses';
import Sections from './Sections';
import TeacherResources from './TeacherResources';
import shapes from './shapes';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import i18n from "@cdo/locale";

const TeacherHomepage = React.createClass({
  propTypes: {
    sections: React.PropTypes.array,
    courses: shapes.courses,
    announcements: React.PropTypes.array.isRequired,
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
  },

  componentDidMount() {
    // The component used here is implemented in legacy HAML/CSS rather than React.
    $('#terms_reminder').appendTo(ReactDOM.findDOMNode(this.refs.termsReminder)).show();
  },

  render() {
    const { courses, sections, announcements, codeOrgUrlPrefix } = this.props;

    return (
      <div>
        <HeaderBanner
          headingText={i18n.homepageHeading()}
          extended={false}
        />
        <ProtectedStatefulDiv
          ref="termsReminder"
        />
        <Announcements
          announcements={announcements}
        />
        <Sections
          sections={sections}
          codeOrgUrlPrefix={codeOrgUrlPrefix}
        />
        <RecentCourses
          courses={courses}
          showAllCoursesLink={true}
          heading={i18n.recentCourses()}
          isTeacher={true}
        />
        <TeacherResources codeOrgUrlPrefix={codeOrgUrlPrefix}/>
      </div>
    );
  }
});

export default TeacherHomepage;
