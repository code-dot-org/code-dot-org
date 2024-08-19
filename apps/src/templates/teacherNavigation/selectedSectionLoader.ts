import {getStore} from '@cdo/apps/redux';
import {setScriptId} from '@cdo/apps/redux/unitSelectionRedux';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import {
  setLoginType,
  setShowSharingColumn,
} from '../manageStudents/manageStudentsRedux';
import {
  selectSection,
  setRosterProvider,
  setRosterProviderName,
  setStudentsForCurrentSection,
} from '../teacherDashboard/teacherSectionsRedux';

export const asyncLoadSelectedSection = async (sectionId: string) => {
  getStore().dispatch(selectSection(sectionId));

  const response = await fetch(`/dashboardapi/section/${sectionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': await getAuthenticityToken(),
    },
  });

  return response.json().then(selectedSection => {
    getStore().dispatch(
      setStudentsForCurrentSection(selectedSection.id, selectedSection.students)
    );
    // Default the scriptId to the script assigned to the section
    const defaultScriptId = selectedSection.script
      ? selectedSection.script.id
      : null;
    if (defaultScriptId) {
      getStore().dispatch(setScriptId(defaultScriptId));
    }

    if (
      !selectedSection.sharing_disabled &&
      selectedSection.script.project_sharing
    ) {
      getStore().dispatch(setShowSharingColumn(true));
    }
    getStore().dispatch(setLoginType(selectedSection.login_type));
    getStore().dispatch(setRosterProvider(selectedSection.login_type));
    getStore().dispatch(setRosterProviderName(selectedSection.login_type_name));
  });
};
