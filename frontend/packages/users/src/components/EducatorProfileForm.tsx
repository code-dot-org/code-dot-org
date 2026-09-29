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

import EducatorRole from '../sections/EducatorRole';
import SchoolInformation from '../sections/SchoolInformation';

import {toFormErrors} from './modalErrors';

/**
 * The Educator Profile tab body. The role saves on the save bar; the school is a
 * modal flow of its own, needing a search and a different endpoint.
 */
export default function EducatorProfileForm({
  settings,
}: {
  settings: UserSettings;
}) {
  const state = useFormState();
  const dispatch = useFormDispatch();
  const toast = useToast();
  const mutation = useUpdateProfile(DashboardApiClient);

  const handleSave = async () => {
    if (state.save.status === 'saving') return;

    // The role is the only field here and can never be cleared, so an unchanged
    // or blank value has nothing to send: clear the bar without a request.
    const educatorRole = dirtyValues(state).educator_role;
    if (!educatorRole) {
      dispatch({type: 'reset'});
      return;
    }

    dispatch({type: 'saveStarted'});
    try {
      await mutation.mutateAsync({educatorRole});
      dispatch({type: 'saveSucceeded'});
      toast('Changes saved.');
    } catch (error) {
      const {fieldErrors, formErrors} = toFormErrors(error);
      dispatch({type: 'saveFailed', fieldErrors, formErrors});
    }
  };

  return (
    // Not a <form>: the update-school dialog portals out of the DOM but still
    // bubbles its submit through the React tree, which a form here would catch.
    <Box>
      <SchoolInformation settings={settings} />
      <EducatorRole settings={settings} />
      <SaveBar onSave={handleSave} />
    </Box>
  );
}
