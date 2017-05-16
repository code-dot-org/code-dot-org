import React from 'react';
import AnnouncementsCollapsible from './AnnouncementsCollapsible';
import RecentCoursesCollapsible from './RecentCoursesCollapsible';
import ManageSectionsCollapsible from './ManageSectionsCollapsible';
import TeacherResources from './TeacherResources';
import shapes from './shapes';

const TeacherHomepage = React.createClass({
  propTypes: {
    courses: shapes.courses,
    sections: React.PropTypes.array,
    announcements: React.PropTypes.array.isRequired,
    urlPrefix: React.PropTypes.string.isRequired,
    studioUrlPrefix: React.PropTypes.string.isRequired
  },

  render() {
    const { courses, sections, announcements, urlPrefix, studioUrlPrefix } = this.props;

    return (
      <div>
        <AnnouncementsCollapsible announcements={announcements}/>
        <RecentCoursesCollapsible
          courses={courses}
          showAllCoursesLink={true}
        />
        <ManageSectionsCollapsible sections={sections}/>
        <TeacherResources/>
        />
      </div>
    );
  }
});

export default TeacherHomepage;
