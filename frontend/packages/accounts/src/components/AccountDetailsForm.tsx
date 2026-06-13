import {useMutation} from '@tanstack/react-query';
import type {FormEvent} from 'react';

import {updateProfile} from '../api/accounts.api';
import type {AccountSettings, UpdateProfileParams} from '../api/accounts.types';
import {AccountsApiValidationError} from '../api/AccountsApiValidationError';
import AccountActions from '../sections/AccountActions';
import LanguageSection from '../sections/Language';
import LoginInformation from '../sections/LoginInformation';
import MyInformation from '../sections/MyInformation';
import {useFormDispatch, useFormState} from '../state/FormContext';
import {dirtyValues} from '../state/formReducer';

import SaveBar from './SaveBar';

const GENERIC_ERROR = 'Something went wrong. Please try again.';

/**
 * The Account Details tab body: one `<form>` whose save bar persists all
 * pending My Information edits in a single PATCH (design D13). Email, password,
 * account type, and deletion are their own flows (modals), not this form.
 */
export default function AccountDetailsForm({
  settings,
}: {
  settings: AccountSettings;
}) {
  const state = useFormState();
  const dispatch = useFormDispatch();
  const mutation = useMutation({mutationFn: updateProfile});

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (state.save.status === 'saving') return; // double-submit guard
    dispatch({type: 'saveStarted'});

    const dirty = dirtyValues(state);
    const params: UpdateProfileParams = {
      ...(dirty.given_name !== undefined && {givenName: dirty.given_name}),
      ...(dirty.family_name !== undefined && {familyName: dirty.family_name}),
      ...(dirty.name !== undefined && {displayName: dirty.name}),
    };

    try {
      await mutation.mutateAsync(params);
      dispatch({type: 'saveSucceeded'});
    } catch (error) {
      if (error instanceof AccountsApiValidationError) {
        dispatch({
          type: 'saveFailed',
          fieldErrors: error.fieldErrors,
          formErrors: error.isEmpty ? [GENERIC_ERROR] : error.formErrors,
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
      <LanguageSection />
      <AccountActions settings={settings} />
      <SaveBar />
    </form>
  );
}
