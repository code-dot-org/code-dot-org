import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import HeaderBanner from '../HeaderBanner';
import RecentCourses from './RecentCourses';
import Sections from './Sections';
import TeacherResources from './TeacherResources';
import Notification from '../Notification';
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
    $('#flashes').appendTo(ReactDOM.findDOMNode(this.refs.flashes)).show();
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
          ref="flashes"
        />
        <ProtectedStatefulDiv
          ref="termsReminder"
        />
        <Notification
          type="bullhorn"
          notice={announcements[0].heading}
          details={announcements[0].description}
          dismissible={false}
          buttonText={announcements[0].buttonText}
          buttonLink={announcements[0].link}
          analyticId={announcements[0].id}
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
