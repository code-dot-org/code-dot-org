import React from 'react';
import AnnouncementsCollapsible from './AnnouncementsCollapsible';
import RecentCoursesCollapsible from './RecentCoursesCollapsible';
import ManageSectionsCollapsible from './ManageSectionsCollapsible';
import Resources from './Resources';

const TeacherHomepage = React.createClass({
  propTypes: {
    courses: React.PropTypes.array,
    sections: React.PropTypes.array,
    announcements: React.PropTypes.array.isRequired,
  },

  render() {
    const { courses, sections, announcements } = this.props;

    return (
      <div>
        <AnnouncementsCollapsible announcements={announcements}/>
        <RecentCoursesCollapsible courses={courses}/>
        <ManageSectionsCollapsible sections={sections}/>
        <Resources type="teacher"/>
      </div>
    );
  }
});

export default TeacherHomepage;
