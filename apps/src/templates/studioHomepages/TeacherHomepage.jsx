import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import HeadingBanner from '../HeadingBanner';
import AnnouncementsCollapsible from './AnnouncementsCollapsible';
import RecentCoursesCollapsible from './RecentCoursesCollapsible';
import ManageSectionsCollapsible from './ManageSectionsCollapsible';
import TeacherResources from './TeacherResources';
import shapes from './shapes';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import i18n from "@cdo/locale";

const TeacherHomepage = React.createClass({
  propTypes: {
    courses: shapes.courses,
    sections: React.PropTypes.array,
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
        <HeadingBanner
          headingText={i18n.homepageHeading()}
          extended={false}
        />
        <ProtectedStatefulDiv
          ref="termsReminder"
        />
        <AnnouncementsCollapsible announcements={announcements}/>
        <RecentCoursesCollapsible
          courses={courses}
          showAllCoursesLink={true}
          heading={i18n.recentCourses()}
          isTeacher={true}
        />
        <ManageSectionsCollapsible
          sections={sections}
          codeOrgUrlPrefix={codeOrgUrlPrefix}
        />
        <TeacherResources codeOrgUrlPrefix={codeOrgUrlPrefix}/>
      </div>
    );
  }
});

export default TeacherHomepage;
