import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import HeaderBanner from '../HeaderBanner';
import {SpecialAnnouncementActionBlock} from './TwoColumnActionBlock';
import Notification from '../Notification';
import RecentCourses from './RecentCourses';
import TeacherSections from './TeacherSections';
import StudentSections from './StudentSections';
import TeacherResources from './TeacherResources';
import ProjectWidgetWithData from '@cdo/apps/templates/projects/ProjectWidgetWithData';
import shapes from './shapes';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const styles = {
  clear: {
    clear: 'both',
    height: 30
  }
};

export default class TeacherHomepage extends Component {
  static propTypes = {
    joinedSections: shapes.sections,
    courses: shapes.courses,
    topCourse: shapes.topCourse,
    announcements: PropTypes.array.isRequired,
    isRtl: PropTypes.bool.isRequired,
    queryStringOpen: PropTypes.string,
    canViewAdvancedTools: PropTypes.bool,
    hocLaunch: PropTypes.object,
    isEnglish: PropTypes.bool.isRequired
  };

  componentDidMount() {
    // The component used here is implemented in legacy HAML/CSS rather than React.
    $('#terms_reminder').appendTo(ReactDOM.findDOMNode(this.refs.termsReminder)).show();
    $('#flashes').appendTo(ReactDOM.findDOMNode(this.refs.flashes)).show();
  }

  render() {
    const { courses, topCourse, announcements, isRtl, queryStringOpen, joinedSections } = this.props;
    const { canViewAdvancedTools, hocLaunch, isEnglish } = this.props;

    return (
      <div>
        <HeaderBanner
          headingText={i18n.homepageHeading()}
          short={true}
        />
        <ProtectedStatefulDiv
          ref="flashes"
        />
        <ProtectedStatefulDiv
          ref="termsReminder"
        />
        {hocLaunch &&
         hocLaunch.special_announcement &&
         (hocLaunch.special_announcement === "mc2017" ||
          (hocLaunch.special_announcement === "applab2017" && !isEnglish) ||
          (hocLaunch.special_announcement === "celebs2017" && !isEnglish)) && (
          <SpecialAnnouncementActionBlock
            isRtl={isRtl}
            imageUrl={pegasus('/images/mc/fill-540x289/special-announcement-hoc2017.jpg')}
            heading={i18n.specialAnnouncementHeading()}
            subHeading={""}
            description={i18n.specialAnnouncementDescription()}
            buttons={[
              {url: 'https://hourofcode.com/#join', text: i18n.joinUs()},
              {url: pegasus('/minecraft'), text: i18n.tryIt()}
            ]}
          />
        )}

        {hocLaunch &&
         hocLaunch.special_announcement &&
         hocLaunch.special_announcement === "applab2017" &&
         isEnglish && (
          <SpecialAnnouncementActionBlock
            isRtl={isRtl}
            imageUrl={pegasus('/images/fill-540x289/special-announcements/applab_hoc2017.jpg')}
            heading={i18n.specialAnnouncementHeadingAppLab()}
            subHeading={""}
            description={i18n.specialAnnouncementDescriptionAppLab()}
            buttons={[
              {url: 'https://hourofcode.com/#join', text: i18n.joinUs()},
              {url: pegasus('/learn'), text: i18n.tryIt()}
            ]}
          />
        )}

        {hocLaunch &&
         hocLaunch.special_announcement &&
         hocLaunch.special_announcement === "celebs2017" &&
         isEnglish && (
          <SpecialAnnouncementActionBlock
            isRtl={isRtl}
            imageUrl={pegasus('/images/fill-540x289/special-announcements/celebs_hoc2017.jpg')}
            heading={i18n.specialAnnouncementHeadingCelebs()}
            subHeading={""}
            description={i18n.specialAnnouncementDescriptionCelebs()}
            buttons={[
              {url: pegasus('/challenge'), text: i18n.celebrityChallenge()},
              {url: pegasus('/learn'), text: i18n.tryHOC()}
            ]}
          />
        )}

        {announcements.length > 0 && (
          <div>
            <Notification
              type={announcements[0].type || "bullhorn"}
              notice={announcements[0].heading}
              details={announcements[0].description}
              dismissible={false}
              buttonText={announcements[0].buttonText}
              buttonLink={announcements[0].link}
              newWindow={true}
              analyticId={announcements[0].id}
              isRtl={isRtl}
            />
            <div style={styles.clear}/>
          </div>
        )}
        <TeacherSections
          isRtl={isRtl}
          queryStringOpen={queryStringOpen}
        />
        <RecentCourses
          courses={courses}
          topCourse={topCourse}
          showAllCoursesLink={true}
          isTeacher={true}
          isRtl={isRtl}
        />
        <TeacherResources isRtl={isRtl}/>
        <ProjectWidgetWithData
          isRtl={isRtl}
          canViewFullList={true}
          canViewAdvancedTools={canViewAdvancedTools}
        />
        <StudentSections
          initialSections={joinedSections}
          canLeave={true}
          isRtl={isRtl}
          isTeacher={true}
        />
      </div>
    );
  }
}
