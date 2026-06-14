import type {FormEvent} from 'react';

import {
  DashboardApiClient,
  useUpdateProfile,
  type AccountSettings,
  type UpdateProfileParams,
} from '@code-dot-org/core/api';

import {asAccountsValidationError} from '../api/AccountsApiValidationError';
import AccountActions from '../sections/AccountActions';
import LoginInformation from '../sections/LoginInformation';
import MyInformation from '../sections/MyInformation';
import {useFormDispatch, useFormState} from '../state/FormContext';
import {dirtyValues} from '../state/formReducer';

import SaveBar from './SaveBar';

const GENERIC_ERROR = 'Something went wrong. Please try again.';

/**
 * The Account Details tab body: one form that persists all pending My
 * Information edits in a single PATCH. Email, password, account type, and
 * deletion are separate modal flows.
 */
export default function AccountDetailsForm({
  settings,
}: {
  settings: AccountSettings;
}) {
  const state = useFormState();
  const dispatch = useFormDispatch();
  const mutation = useUpdateProfile(DashboardApiClient);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (state.save.status === 'saving') return; // double-submit guard
    dispatch({type: 'saveStarted'});

    const dirty = dirtyValues(state);
    const params: UpdateProfileParams = {
      ...(dirty.given_name !== undefined && {givenName: dirty.given_name}),
      ...(dirty.family_name !== undefined && {familyName: dirty.family_name}),
      ...(dirty.name !== undefined && {displayName: dirty.name}),
      ...(dirty.username !== undefined && {username: dirty.username}),
      ...(dirty.age !== undefined && {age: dirty.age}),
      ...(dirty.us_state !== undefined && {usState: dirty.us_state}),
    };

    try {
      await mutation.mutateAsync(params);
      dispatch({type: 'saveSucceeded'});
    } catch (error) {
      const validation = asAccountsValidationError(error);
      if (validation && !validation.isEmpty) {
        dispatch({
          type: 'saveFailed',
          fieldErrors: validation.fieldErrors,
          formErrors: validation.formErrors.length
            ? validation.formErrors
            : [GENERIC_ERROR],
        });
      } else {
        dispatch({
          type: 'saveFailed',
          fieldErrors: {},
          formErrors: [GENERIC_ERROR],
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <MyInformation settings={settings} />
      <LoginInformation settings={settings} />
      <AccountActions settings={settings} />
      <SaveBar />
    </form>
  );
}
