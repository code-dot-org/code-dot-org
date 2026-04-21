import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import {setUnit} from '@cdo/apps/redux/unitSelectionRedux';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import {
  setLoginType,
  setShowSharingColumn,
  loadSectionStudentData,
} from '../manageStudents/manageStudentsRedux';
import {
  finishLoadingSectionData,
  selectSection,
  setRosterProvider,
  setRosterProviderName,
  setStudentsForCurrentSection,
  startLoadingSectionData,
  updateSelectedSection,
} from '../teacherDashboard/teacherSectionsRedux';

export const asyncLoadSelectedSection = async (
  sectionId: string,
  forceReload?: boolean
) => {
  const state = getStore().getState().teacherSections;

  if (
    (state.selectedSectionId === parseInt(sectionId) ||
      state.isLoadingSectionData) &&
    !forceReload
  ) {
    return;
  }

  getStore().dispatch(startLoadingSectionData());
  getStore().dispatch(selectSection(sectionId));
  getStore().dispatch(loadSectionStudentData(sectionId));

  const response = fetch(`/dashboardapi/section/${sectionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': await getAuthenticityToken(),
    },
  });

  return response
    .then(r => r.json())
    .then(setSelectedSectionData)
    .then(() => getStore().dispatch(finishLoadingSectionData()))
    .catch(error => {
      analyticsReporter.sendEvent(EVENTS.SECTION_LOAD_FAILURE, {
        sectionId,
      });
      console.log(error);
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setSelectedSectionData = (sectionData: any) => {
  getStore().dispatch(
    setStudentsForCurrentSection(sectionData.id, sectionData.students)
  );
  // Default Unit assigned to the section
  const defaultUnitId = sectionData.script ? sectionData.script.id : null;
  const defaultCourseVersionId = sectionData.course_version_id;
  if (defaultUnitId) {
    getStore().dispatch(setUnit(defaultUnitId, defaultCourseVersionId));
  }

  if (!sectionData.sharing_disabled && sectionData.script.project_sharing) {
    getStore().dispatch(setShowSharingColumn(true));
  }

  getStore().dispatch(setLoginType(sectionData.login_type));
  getStore().dispatch(setRosterProvider(sectionData.login_type));
  getStore().dispatch(setRosterProviderName(sectionData.login_type_name));

  getStore().dispatch(updateSelectedSection(sectionData));
};
