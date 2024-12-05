import React, {useState} from 'react';
import {generatePath, useNavigate, useParams} from 'react-router-dom';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {
  TEACHER_NAVIGATION_PATHS,
  LABELED_TEACHER_NAVIGATION_PATHS,
} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import experiments from '@cdo/apps/util/experiments';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import UnitOverview from './UnitOverview';
import {UnitSummaryResponse, setUnitSummaryReduxData} from './UnitSummaryUtils';

interface TeacherUnitOverviewProps {}

const TeacherUnitOverview: React.FC<TeacherUnitOverviewProps> = () => {
  const [unitSummaryResponse, setUnitSummaryResponse] =
    useState<UnitSummaryResponse | null>(null);
  const [unitLoaded, setUnitLoaded] = useState<string | null>(null);

  const selectedSection = useAppSelector(selectedSectionSelector);

  const {userId, userType} = useAppSelector(state => ({
    userId: state.currentUser.userId,
    userType: state.currentUser.userType,
  }));

  const dispatch = useAppDispatch();

  const navigate = useNavigate();
  const {unitName} = useParams();

  React.useEffect(() => {
    if (!unitName && selectedSection?.unitName) {
      navigate(
        generatePath(
          LABELED_TEACHER_NAVIGATION_PATHS.unitOverview.absoluteUrl,
          {unitName: selectedSection.unitName, sectionId: selectedSection.id}
        ),
        {replace: true}
      );
      return;
    }
  }, [unitName, selectedSection, navigate]);

  React.useEffect(() => {
    if (!unitName || !userType || !userId) {
      return;
    }

    if (unitLoaded === unitName) {
      return;
    }

    setUnitSummaryResponse(null);
    setUnitLoaded(unitName);

    HttpClient.fetchJson<UnitSummaryResponse>(
      `/dashboardapi/unit_summary/${unitName}`
    )
      .then(response => response?.value)
      .then(responseJson => {
        setUnitSummaryReduxData(responseJson, dispatch, userType, userId);
        setUnitSummaryResponse(responseJson);

        analyticsReporter.sendEvent(
          EVENTS.TEACHER_NAV_UNIT_OVERVIEW_PAGE_VIEWED,
          {
            unitName: unitName,
          }
        );
      })
      .catch(error => {
        console.error('Error loading unit overview', error);

        analyticsReporter.sendEvent(EVENTS.TEACHER_NAV_UNIT_OVERVIEW_FAILED, {
          unitName,
        });
      });
  }, [
    unitName,
    userType,
    userId,
    dispatch,
    navigate,
    selectedSection,
    unitLoaded,
    setUnitLoaded,
  ]);

  if (
    !unitSummaryResponse ||
    !unitSummaryResponse.unitData ||
    unitSummaryResponse.unitData.name !== unitName
  ) {
    return <Spinner size={'large'} />;
  }

  const unitHasLevels = unitSummaryResponse.unitData.lessons.reduce(
    (n, {levels}) => n || !!levels?.length,
    false
  );

  const showAiAssessmentsAnnouncement =
    unitSummaryResponse.unitData.showAiAssessmentsAnnouncement &&
    experiments.isEnabled(experiments.AI_ASSESSMENTS_ANNOUNCEMENT);

  return (
    <UnitOverview
      id={selectedSection.unitId}
      courseId={selectedSection.courseId}
      courseOfferingId={selectedSection.courseOfferingId}
      courseVersionId={selectedSection.courseVersionId}
      courseTitle={unitSummaryResponse.unitData.course_title}
      courseLink={
        unitSummaryResponse.unitData.course_name
          ? generatePath('../' + TEACHER_NAVIGATION_PATHS.courseOverview, {
              courseVersionName: unitSummaryResponse.unitData.course_name,
            })
          : null
      }
      excludeCsfColumnInLegend={!unitSummaryResponse.unitData.csf}
      teacherResources={unitSummaryResponse.unitData.teacher_resources}
      studentResources={unitSummaryResponse.unitData.student_resources || []}
      showCourseUnitVersionWarning={
        unitSummaryResponse.unitData.show_course_unit_version_warning
      }
      showScriptVersionWarning={
        unitSummaryResponse.unitData.show_script_version_warning
      }
      showRedirectWarning={false} // TODO: https://codedotorg.atlassian.net/browse/TEACH-1374
      redirectScriptUrl={''}
      versions={unitSummaryResponse.unitData.course_versions}
      courseName={unitSummaryResponse.unitData.course_name}
      showAssignButton={unitSummaryResponse.unitData.show_assign_button}
      isProfessionalLearningCourse={unitSummaryResponse.unitData.isPlCourse}
      userId={userId}
      userType={userType}
      assignedSectionId={selectedSection.id}
      showCalendar={unitSummaryResponse.unitData.showCalendar}
      versionYear={unitSummaryResponse.unitData.version_year}
      weeklyInstructionalMinutes={
        unitSummaryResponse.unitData.weeklyInstructionalMinutes
      }
      unitCalendarLessons={unitSummaryResponse.unitData.calendarLessons}
      unitHasLevels={unitHasLevels}
      isMigrated={unitSummaryResponse.unitData.is_migrated}
      scriptOverviewPdfUrl={unitSummaryResponse.unitData.scriptOverviewPdfUrl}
      scriptResourcesPdfUrl={unitSummaryResponse.unitData.scriptResourcesPdfUrl}
      isCsdOrCsp={
        unitSummaryResponse.unitData.isCsd || unitSummaryResponse.unitData.isCsp
      }
      completedLessonNumber={null} // Do we need this query param
      publishedState={unitSummaryResponse.unitData.publishedState}
      participantAudience={unitSummaryResponse.unitData.participantAudience}
      showAiAssessmentsAnnouncement={showAiAssessmentsAnnouncement}
    />
  );
};

export default TeacherUnitOverview;
