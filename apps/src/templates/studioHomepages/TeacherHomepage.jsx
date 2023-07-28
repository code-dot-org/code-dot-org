import PropTypes from 'prop-types';
import React, {useState, useEffect, useRef} from 'react';
import {connect} from 'react-redux';
import $ from 'jquery';
import HeaderBanner from '../HeaderBanner';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import MarketingAnnouncementBanner from './MarketingAnnouncementBanner';
import RecentCourses from './RecentCourses';
import TeacherSections from './TeacherSections';
import TeacherResources from './TeacherResources';
import JoinSectionArea from '@cdo/apps/templates/studioHomepages/JoinSectionArea';
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
import ParticipantFeedbackNotification from '@cdo/apps/templates/feedback/ParticipantFeedbackNotification';
import IncubatorBanner from './IncubatorBanner';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import ProfessionalLearningSkinnyBanner from '../ProfessionalLearningSkinnyBanner';

const LOGGED_TEACHER_SESSION = 'logged_teacher_session';

export const UnconnectedTeacherHomepage = ({
  announcement,
  canViewAdvancedTools,
  censusQuestion,
  plCourses,
  courses,
  afeEligible,
  isEnglish,
  joinedStudentSections,
  joinedPlSections,
  ncesSchoolId,
  queryStringOpen,
  schoolYear,
  showCensusBanner,
  showFinishTeacherApplication,
  showReturnToReopenedTeacherApplication,
  showNpsSurvey,
  specialAnnouncement,
  teacherEmail,
  teacherId,
  teacherName,
  topCourse,
  topPlCourse,
  beginGoogleImportRosterFlow,
  hasFeedback,
  showIncubatorBanner,
  currentUserId,
  showDeprecatedCalcAndEvalWarning,
}) => {
  const censusBanner = useRef(null);
  const teacherReminders = useRef(null);
  const flashes = useRef(null);

  /* We are hiding the PL application banner to free up space on the Teacher Homepage (May 2023)
   * when we want to show the Census banner again set this to true
   */
  const showPLBanner = false;

  /* We are hiding the Census banner to free up space on the Teacher Homepage (May 2023)
   * when we want to show the Census banner again remove the next line
   */
  showCensusBanner = false;
  const [displayCensusBanner, setDisplayCensusBanner] =
    useState(showCensusBanner);
  const [censusSubmittedSuccessfully, setCensusSubmittedSuccessfully] =
    useState(null);
  const [censusBannerTeachesSelection, setCensusBannerTeachesSelection] =
    useState(null);
  const [censusBannerInClassSelection, setCensusBannerInClassSelection] =
    useState(null);
  const [showCensusUnknownError, setShowCensusUnknownError] = useState(false);
  const [showCensusInvalidError, setShowCensusInvalidError] = useState(false);

  useEffect(() => {
    // The component used here is implemented in legacy HAML/CSS rather than React.
    $('#teacher_reminders').appendTo(teacherReminders.current.refs.root).show();
    $('#flashes').appendTo(flashes.current.refs.root).show();

    // A special on-load behavior: If requested by queryparam, automatically
    // launch the Google Classroom rostering flow.
    if (queryStringOpen === 'rosterDialog') {
      beginGoogleImportRosterFlow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCensusBannerSubmit = () => {
    if (censusBanner.current.isValid()) {
      $.ajax({
        url: '/dashboardapi/v1/census/CensusTeacherBannerV1',
        type: 'post',
        dataType: 'json',
        data: censusBanner.current.getData(),
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
      type: 'post',
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
      type: 'post',
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

  const showAFEBanner = isEnglish && afeEligible;

  // Send one analytics event when a teacher logs in. Use session storage to determine
  // whether they've just logged in.
  if (
    !!currentUserId &&
    tryGetSessionStorage(LOGGED_TEACHER_SESSION, 'false') !== 'true'
  ) {
    trySetSessionStorage(LOGGED_TEACHER_SESSION, 'true');

    analyticsReporter.sendEvent(EVENTS.TEACHER_LOGIN_EVENT, {
      'user id': currentUserId,
    });
  }

  return (
    <div>
      <HeaderBanner
        headingText={i18n.homepageHeading()}
        backgroundUrl={backgroundUrl}
      />
      <div className={'container main'}>
        <ProtectedStatefulDiv ref={flashes} />
        {showDeprecatedCalcAndEvalWarning && (
          <Notification
            type={NotificationType.warning}
            notice={i18n.deprecatedCalcAndEvalWarning()}
            details={i18n.deprecatedCalcAndEvalDetails()}
            dismissible={false}
          />
        )}
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
            buttonUrl="/pd/application/teacher"
            solidBorder={true}
          />
        )}
        {showPLBanner && <ProfessionalLearningSkinnyBanner />}
        {showReturnToReopenedTeacherApplication && (
          <BorderedCallToAction
            headingText="Return to Your Application"
            descriptionText="Your Regional Partner has requested updates to your Professional Learning Application."
            buttonText="Return to Application"
            buttonColor={Button.ButtonColor.orange}
            buttonUrl="/pd/application/teacher"
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
        {showAFEBanner && (
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
          hasFeedback={false}
        />
        {hasFeedback && (plCourses?.length > 0 || topPlCourse) && (
          <ParticipantFeedbackNotification
            studentId={teacherId}
            isProfessionalLearningCourse={true}
          />
        )}
        {(plCourses?.length > 0 || topPlCourse) && (
          <RecentCourses
            courses={plCourses}
            topCourse={topPlCourse}
            showAllCoursesLink={true}
            isProfessionalLearningCourse={true}
            hasFeedback={hasFeedback}
          />
        )}
        <TeacherResources />
        {showIncubatorBanner && <IncubatorBanner />}
        <ProjectWidgetWithData
          canViewFullList={true}
          canViewAdvancedTools={canViewAdvancedTools}
        />
        <JoinSectionArea
          initialJoinedStudentSections={joinedStudentSections}
          initialJoinedPlSections={joinedPlSections}
          isTeacher={true}
        />
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
  afeEligible: PropTypes.bool,
  hocLaunch: PropTypes.string,
  isEnglish: PropTypes.bool.isRequired,
  joinedStudentSections: shapes.sections,
  joinedPlSections: shapes.sections,
  ncesSchoolId: PropTypes.string,
  queryStringOpen: PropTypes.string,
  schoolYear: PropTypes.number,
  showCensusBanner: PropTypes.bool.isRequired,
  showNpsSurvey: PropTypes.bool,
  showFinishTeacherApplication: PropTypes.bool,
  showReturnToReopenedTeacherApplication: PropTypes.bool,
  specialAnnouncement: shapes.specialAnnouncement,
  teacherEmail: PropTypes.string,
  teacherId: PropTypes.number,
  teacherName: PropTypes.string,
  topCourse: shapes.topCourse,
  topPlCourse: shapes.topCourse,
  beginGoogleImportRosterFlow: PropTypes.func,
  hasFeedback: PropTypes.bool,
  showIncubatorBanner: PropTypes.bool,
  currentUserId: PropTypes.number,
  showDeprecatedCalcAndEvalWarning: PropTypes.bool,
};

const styles = {
  clear: {
    clear: 'both',
    height: 30,
  },
};

export default connect(state => ({}), {beginGoogleImportRosterFlow})(
  UnconnectedTeacherHomepage
);
