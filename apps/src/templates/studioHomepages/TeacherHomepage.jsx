import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import HeaderBanner from '../HeaderBanner';
import Notification from '../Notification';
import RecentCourses from './RecentCourses';
import Sections from './Sections';
import TeacherResources from './TeacherResources';
import ProjectWidgetWithData from '@cdo/apps/templates/projects/ProjectWidgetWithData';
import shapes from './shapes';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import i18n from "@cdo/locale";

const styles = {
  clear: {
    clear: 'both',
    height: 30
  }
};

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
          short={true}
        />
        <ProtectedStatefulDiv
          ref="flashes"
        />
        <ProtectedStatefulDiv
          ref="termsReminder"
        />
        {announcements.length > 0 && (
          <div>
            <Notification
              type="bullhorn"
              notice={announcements[0].heading}
              details={announcements[0].description}
              dismissible={false}
              buttonText={announcements[0].buttonText}
              buttonLink={announcements[0].link}
              newWindow={true}
              analyticId={announcements[0].id}
            />
            <div style={styles.clear}/>
          </div>
        )}

        <Sections
          sections={sections}
          codeOrgUrlPrefix={codeOrgUrlPrefix}
          isRtl={isRtl}
          isTeacher={true}
          canLeave={false}
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
        <ProjectWidgetWithData/>
      </div>
    );
  }
});

export default TeacherHomepage;
