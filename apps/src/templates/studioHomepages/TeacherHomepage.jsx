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
    isRtl: React.PropTypes.bool.isRequired
  },

  componentDidMount() {
    // The component used here is implemented in legacy HAML/CSS rather than React.
    $('#terms_reminder').appendTo(ReactDOM.findDOMNode(this.refs.termsReminder)).show();
    $('#flashes').appendTo(ReactDOM.findDOMNode(this.refs.flashes)).show();
  },

  render() {
    const { courses, sections, announcements, codeOrgUrlPrefix, isRtl } = this.props;

    return (
      <div>
        <HeaderBanner
          headingText={i18n.homepageHeading()}
          extended={false}
        />
        <ProtectedStatefulDiv
          ref="flashes"
        />
        <ProtectedStatefulDiv
          ref="termsReminder"
        />
        <Announcements
          announcements={announcements}
          isRtl={isRtl}
        />
        <Sections
          sections={sections}
          codeOrgUrlPrefix={codeOrgUrlPrefix}
          isRtl={isRtl}
        />
        <RecentCourses
          courses={courses}
          showAllCoursesLink={true}
          heading={i18n.recentCourses()}
          isTeacher={true}
          isRtl={isRtl}
        />
        <TeacherResources
          codeOrgUrlPrefix={codeOrgUrlPrefix}
          isRtl={isRtl}
        />
      </div>
    );
  }
});

export default TeacherHomepage;
