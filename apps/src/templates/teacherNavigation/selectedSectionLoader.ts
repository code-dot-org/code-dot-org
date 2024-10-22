import {getStore} from '@cdo/apps/redux';
import {setScriptId, setUnitName} from '@cdo/apps/redux/unitSelectionRedux';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import {
  setLoginType,
  setShowSharingColumn,
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

export const asyncLoadSelectedSection = async (sectionId: string) => {
  const state = getStore().getState().teacherSections;

  if (
    state.selectedSectionId === parseInt(sectionId) ||
    state.isLoadingSectionData
  ) {
    return;
  }

  getStore().dispatch(startLoadingSectionData());
  getStore().dispatch(selectSection(sectionId));

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
    .then(() => getStore().dispatch(finishLoadingSectionData()));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setSelectedSectionData = (sectionData: any) => {
  console.log('lfm 1', {sectionData});
  getStore().dispatch(
    setStudentsForCurrentSection(sectionData.id, sectionData.students)
  );
  // Default the scriptId to the script assigned to the section
  const defaultScriptId = sectionData.script ? sectionData.script.id : null;
  if (defaultScriptId) {
    getStore().dispatch(setScriptId(defaultScriptId));
  }

  if (!sectionData.sharing_disabled && sectionData.script.project_sharing) {
    getStore().dispatch(setShowSharingColumn(true));
  }

  // TODO: update sections list with selected section data to ensure consistency.

  getStore().dispatch(setUnitName(sectionData.script.name));
  getStore().dispatch(setLoginType(sectionData.login_type));
  getStore().dispatch(setRosterProvider(sectionData.login_type));
  getStore().dispatch(setRosterProviderName(sectionData.login_type_name));

  getStore().dispatch(updateSelectedSection(sectionData));
};
