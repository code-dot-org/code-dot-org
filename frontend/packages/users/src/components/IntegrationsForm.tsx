import {Box} from '@mui/material';

import {
  dirtyValues,
  SaveBar,
  useFormDispatch,
  useFormState,
} from '@code-dot-org/component-library/form';
import {useToast} from '@code-dot-org/component-library/toast';
import {
  DashboardApiClient,
  useUpdateProfile,
  type UserSettings,
} from '@code-dot-org/core/api';
import {sendEvent} from '@code-dot-org/core/plugins/analytics';

import IntegrationSettings from '../sections/IntegrationSettings';
import LinkedAccounts from '../sections/LinkedAccounts';

import {toFormErrors} from './modalErrors';

/**
 * The Integrations tab body. Linked accounts connect and disconnect by page
 * navigation; only the settings save on the save bar.
 */
export default function IntegrationsForm({settings}: {settings: UserSettings}) {
  const {integrations} = settings;
  const state = useFormState();
  const dispatch = useFormDispatch();
  const toast = useToast();
  const mutation = useUpdateProfile(DashboardApiClient);

  const handleSave = async () => {
    if (state.save.status === 'saving') return;

    const rosterSync = dirtyValues(state).lti_roster_sync_enabled;
    if (rosterSync === undefined) {
      dispatch({type: 'reset'});
      return;
    }

    const ltiRosterSyncEnabled = rosterSync === 'true';
    sendEvent(
      ltiRosterSyncEnabled ? 'lti_opt_out_toggle_on' : 'lti_opt_out_toggle_off',
      {lms_name: integrations.lmsName},
    );

    dispatch({type: 'saveStarted'});
    try {
      await mutation.mutateAsync({ltiRosterSyncEnabled});
      dispatch({type: 'saveSucceeded'});
      toast('Changes saved.');
    } catch (error) {
      const {fieldErrors, formErrors} = toFormErrors(error);
      dispatch({type: 'saveFailed', fieldErrors, formErrors});
    }
  };

  return (
    <Box>
      {integrations.canManageLinkedAccounts && (
        <LinkedAccounts settings={settings} />
      )}
      {integrations.ltiRosterSyncEnabled !== undefined && (
        <>
          <IntegrationSettings />
          <SaveBar onSave={handleSave} />
        </>
      )}
    </Box>
  );
}
