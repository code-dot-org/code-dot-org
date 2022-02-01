import PropTypes from 'prop-types';
import React, {useState, useEffect, useRef} from 'react';
import {connect} from 'react-redux';
import $ from 'jquery';
import HeaderBanner from '../HeaderBanner';
import Notification from '../Notification';
import MarketingAnnouncementBanner from './MarketingAnnouncementBanner';
import RecentCourses from './RecentCourses';
import TeacherSections from './TeacherSections';
import StudentSections from './StudentSections';
import TeacherResources from './TeacherResources';
import ProjectWidgetWithData from '@cdo/apps/templates/projects/ProjectWidgetWithData';
import shapes from './shapes';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import NpsSurveyBlock from './NpsSurveyBlock';
import i18n from '@cdo/locale';
import CensusTeacherBanner from '../census2017/CensusTeacherBanner';
import DonorTeacherBanner from '@cdo/apps/templates/DonorTeacherBanner';
import {beginGoogleImportRosterFlow} from '../teacherDashboard/teacherSectionsRedux';
import BorderedCallToAction from '@cdo/apps/templates/studioHomepages/BorderedCallToAction';
import Button from '@cdo/apps/templates/Button';

export const UnconnectedTeacherHomepage = ({
  announcement,
  canViewAdvancedTools,
  censusQuestion,
  plCourses,
  courses,
  donorBannerName,
  isEnglish,
  joinedSections,
  ncesSchoolId,
  queryStringOpen,
  schoolYear,
  showCensusBanner,
  showFinishTeacherApplication,
  showNpsSurvey,
  specialAnnouncement,
  teacherEmail,
  teacherId,
  teacherName,
  topCourse,
  topPlCourse,
  beginGoogleImportRosterFlow
}) => {
  const censusBanner = useRef(null);
  const teacherReminders = useRef(null);
  const flashes = useRef(null);

  const [displayCensusBanner, setDisplayCensusBanner] = useState(
    showCensusBanner
  );
  const [
    censusSubmittedSuccessfully,
    setCensusSubmittedSuccessfully
  ] = useState(null);
  const [
    censusBannerTeachesSelection,
    setCensusBannerTeachesSelection
  ] = useState(null);
  const [
    censusBannerInClassSelection,
    setCensusBannerInClassSelection
  ] = useState(null);
  const [showCensusUnknownError, setShowCensusUnknownError] = useState(false);
  const [showCensusInvalidError, setShowCensusInvalidError] = useState(false);

  useEffect(() => {
    // The component used here is implemented in legacy HAML/CSS rather than React.
    $('#teacher_reminders')
      .appendTo(teacherReminders.current.refs.root)
      .show();
    $('#flashes')
      .appendTo(flashes.current.refs.root)
      .show();

    // A special on-load behavior: If requested by queryparam, automatically
    // launch the Google Classroom rostering flow.
    if (queryStringOpen === 'rosterDialog') {
      beginGoogleImportRosterFlow();
    }
  }, []);

  const handleCensusBannerSubmit = () => {
    if (censusBanner.current.isValid()) {
      $.ajax({
        url: '/dashboardapi/v1/census/CensusTeacherBannerV1',
        type: 'post',
        dataType: 'json',
        data: censusBanner.current.getData()
      })
        .done(() => {
          setCensusSubmittedSuccessfully(true);
          dismissCensusBanner(null, null);
        })
        .fail(() => {
          setShowCensusUnknownError(true);
        });
    } else {
      setShowCensusInvalidError(true);
    }
  };

  const dismissCensusBanner = (onSuccess, onFailure) => {
    $.ajax({
      url: `/api/v1/users/${teacherId}/dismiss_census_banner`,
      type: 'post'
    })
      .done(onSuccess)
      .fail(xhr => {
        console.error(
          `Failed to dismiss future census banner! ${xhr.responseText}`
        );
        onFailure();
      });
  };

  const hideCensusBanner = () => {
    setDisplayCensusBanner(false);
  };

  const dismissAndHideCensusBanner = () => {
    dismissCensusBanner(hideCensusBanner, hideCensusBanner);
  };

  const postponeCensusBanner = () => {
    $.ajax({
      url: `/api/v1/users/${teacherId}/postpone_census_banner`,
      type: 'post'
    })
      .done(hideCensusBanner)
      .fail(xhr => {
        console.error(`Failed to postpone census banner! ${xhr.responseText}`);
        hideCensusBanner();
      });
  };

  // Whether we show the regular announcement/notification
  const showAnnouncement = false;

  // Verify background image works for both LTR and RTL languages.
  const backgroundUrl = '/shared/images/banners/teacher-homepage-hero.jpg';

  const showDonorBanner = isEnglish && donorBannerName;

  // [MEG] TODO: Once experiment is complete, modify buttonUrl not to use experiment
  return (
    <div>
      <HeaderBanner
        headingText={i18n.homepageHeading()}
        short={true}
        backgroundUrl={backgroundUrl}
      />
      <div className={'container main'}>
        <ProtectedStatefulDiv ref={flashes} />
        <ProtectedStatefulDiv ref={teacherReminders} />
        {showNpsSurvey && <NpsSurveyBlock />}
        {isEnglish && specialAnnouncement && (
          <MarketingAnnouncementBanner
            announcement={specialAnnouncement}
            marginBottom="30px"
          />
        )}
        {announcement && showAnnouncement && (
          <div>
            <Notification
              type={announcement.type || 'bullhorn'}
              notice={announcement.heading}
              details={announcement.description}
              dismissible={true}
              buttonText={announcement.buttonText}
              buttonLink={announcement.link}
              newWindow={true}
              googleAnalyticsId={announcement.id}
            />
            <div style={styles.clear} />
          </div>
        )}
        {!showAnnouncement && <br />}
        {showFinishTeacherApplication && (
          <BorderedCallToAction
            headingText="Return to Your Application"
            descriptionText="Finish applying for our Professional Learning Program"
            buttonText="Finish Application"
            buttonColor={Button.ButtonColor.orange}
            buttonUrl="/pd/application/teacher?enableExperiments=teacher-application-saving-reopening"
            solidBorder={true}
          />
        )}
        {displayCensusBanner && (
          <div>
            <CensusTeacherBanner
              ref={censusBanner}
              schoolYear={schoolYear}
              ncesSchoolId={ncesSchoolId}
              question={censusQuestion}
              teaches={censusBannerTeachesSelection}
              inClass={censusBannerInClassSelection}
              teacherId={teacherId}
              teacherName={teacherName}
              teacherEmail={teacherEmail}
              showInvalidError={showCensusInvalidError}
              showUnknownError={showCensusUnknownError}
              submittedSuccessfully={censusSubmittedSuccessfully}
              onSubmit={() => handleCensusBannerSubmit()}
              onDismiss={() => dismissAndHideCensusBanner()}
              onPostpone={() => postponeCensusBanner()}
              onTeachesChange={event =>
                setCensusBannerTeachesSelection(
                  event.target.id === 'teachesYes'
                )
              }
              onInClassChange={event =>
                setCensusBannerInClassSelection(event.target.id === 'inClass')
              }
            />
            <br />
          </div>
        )}
        {showDonorBanner && (
          <div>
            <DonorTeacherBanner showPegasusLink={true} source="teacher_home" />
            <div style={styles.clear} />
          </div>
        )}
        <TeacherSections />
        <RecentCourses
          courses={courses}
          topCourse={topCourse}
          showAllCoursesLink={true}
          isTeacher={true}
        />
        {(plCourses?.length > 0 || topPlCourse) && (
          <RecentCourses
            courses={plCourses}
            topCourse={topPlCourse}
            showAllCoursesLink={true}
            isProfessionalLearningCourse={true}
          />
        )}
        <TeacherResources />
        <ProjectWidgetWithData
          canViewFullList={true}
          canViewAdvancedTools={canViewAdvancedTools}
        />
        <StudentSections initialSections={joinedSections} isTeacher={true} />
      </div>
    </div>
  );
};

UnconnectedTeacherHomepage.propTypes = {
  announcement: shapes.teacherAnnouncement,
  canViewAdvancedTools: PropTypes.bool,
  censusQuestion: PropTypes.oneOf(['how_many_10_hours', 'how_many_20_hours']),
  plCourses: shapes.courses,
  courses: shapes.courses,
  donorBannerName: PropTypes.string,
  hocLaunch: PropTypes.string,
  isEnglish: PropTypes.bool.isRequired,
  joinedSections: shapes.sections,
  ncesSchoolId: PropTypes.string,
  queryStringOpen: PropTypes.string,
  schoolYear: PropTypes.number,
  showCensusBanner: PropTypes.bool.isRequired,
  showNpsSurvey: PropTypes.bool,
  showFinishTeacherApplication: PropTypes.bool,
  specialAnnouncement: shapes.specialAnnouncement,
  teacherEmail: PropTypes.string,
  teacherId: PropTypes.number,
  teacherName: PropTypes.string,
  topCourse: shapes.topCourse,
  topPlCourse: shapes.topCourse,
  beginGoogleImportRosterFlow: PropTypes.func
};

const styles = {
  clear: {
    clear: 'both',
    height: 30
  }
};

export default connect(
  state => ({}),
  {beginGoogleImportRosterFlow}
)(UnconnectedTeacherHomepage);
