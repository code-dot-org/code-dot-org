import type {FormEvent} from 'react';

import {
  DashboardApiClient,
  useUpdateProfile,
  type AccountSettings,
  type UpdateProfileParams,
} from '@code-dot-org/core/api';

import AccountActions from '../sections/AccountActions';
import LoginInformation from '../sections/LoginInformation';
import MyInformation from '../sections/MyInformation';
import ParentGuardianEmail from '../sections/ParentGuardianEmail';
import {useFormDispatch, useFormState} from '../state/FormContext';
import {dirtyValues} from '../state/formReducer';

import {toFormErrors} from './modalErrors';
import SaveBar from './SaveBar';
import {useToast} from './Toast';

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
  const toast = useToast();
  const mutation = useUpdateProfile(DashboardApiClient);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (state.save.status === 'saving') return; // double-submit guard

    const dirty = dirtyValues(state);
    // Nothing net-changed — don't fire a request (a bare {user:{}} 400s, and a
    // bubbled modal submit must not save). Clear the bar rather than leaving it
    // stuck showing "made changes" with a Save button that no-ops (the user
    // edited then reverted a field).
    if (Object.keys(dirty).length === 0) {
      dispatch({type: 'reset'});
      return;
    }

    dispatch({type: 'saveStarted'});
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
      toast('Changes saved.');
    } catch (error) {
      const {fieldErrors, formErrors} = toFormErrors(error);
      dispatch({type: 'saveFailed', fieldErrors, formErrors});
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <MyInformation settings={settings} />
      <LoginInformation settings={settings} />
      {settings.userType === 'student' && (
        <ParentGuardianEmail settings={settings} />
      )}
      <AccountActions settings={settings} />
      <SaveBar />
    </form>
  );
}
