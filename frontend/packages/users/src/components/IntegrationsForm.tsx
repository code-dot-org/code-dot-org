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
  type IntegrationsSettings,
  type UserSettings,
} from '@code-dot-org/core/api';

import IntegrationSettings from '../sections/IntegrationSettings';
import LinkedAccounts from '../sections/LinkedAccounts';

import {toFormErrors} from './modalErrors';

/**
 * The Integrations tab body. Linked accounts connect and disconnect by page
 * navigation, as in legacy; only the settings save on the save bar.
 */
export default function IntegrationsForm({
  settings,
  integrations,
}: {
  settings: UserSettings;
  integrations: IntegrationsSettings;
}) {
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

    dispatch({type: 'saveStarted'});
    try {
      await mutation.mutateAsync({ltiRosterSyncEnabled: rosterSync === 'true'});
      dispatch({type: 'saveSucceeded'});
      toast('Changes saved.');
    } catch (error) {
      const {fieldErrors, formErrors} = toFormErrors(error);
      dispatch({type: 'saveFailed', fieldErrors, formErrors});
    }
  };

  // Not a <form>: each linked account row is its own native form.
  return (
    <Box>
      {integrations.canManageLinkedAccounts && (
        <LinkedAccounts settings={settings} integrations={integrations} />
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
