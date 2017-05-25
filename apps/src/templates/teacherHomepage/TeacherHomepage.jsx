import React from 'react';
import HeadingBanner from '../HeadingBanner';
import AnnouncementsCollapsible from './AnnouncementsCollapsible';
import RecentCoursesCollapsible from './RecentCoursesCollapsible';
import ManageSectionsCollapsible from './ManageSectionsCollapsible';
import TeacherResources from './TeacherResources';
import shapes from './shapes';
import i18n from "@cdo/locale";

const TeacherHomepage = React.createClass({
  propTypes: {
    courses: shapes.courses,
    sections: React.PropTypes.array,
    announcements: React.PropTypes.array.isRequired,
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
  },

  render() {
    const { courses, sections, announcements, codeOrgUrlPrefix } = this.props;

    return (
      <div>
        <HeadingBanner
          headingText={i18n.homepageHeading()}
          extended={false}
        />
        <AnnouncementsCollapsible announcements={announcements}/>
        <RecentCoursesCollapsible
          courses={courses}
          showAllCoursesLink={true}
          header={i18n.recentCourses()}
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
