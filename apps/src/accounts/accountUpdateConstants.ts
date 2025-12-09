import {hasQueryParam, updateQueryParam} from '@cdo/apps/code-studio/utils';

export enum AccountSettingsSectionUrlParams {
  AccountInformation = 'accountInformation',
  SchoolInformation = 'schoolInformation',
}

// If the URL contains the given param, its removed from the URL since that
// section has just been saved in the Account Settings and no longer needs
// to be tracked. It returns if the user has finished all account updates
// tracked by the URL params (i.e. if none are left).
export function handleUpdateUrlOnSettingsSave(
  accountSettingsSection: AccountSettingsSectionUrlParams
) {
  updateQueryParam(accountSettingsSection, undefined, false);

  return !(
    hasQueryParam(AccountSettingsSectionUrlParams.AccountInformation) ||
    hasQueryParam(AccountSettingsSectionUrlParams.SchoolInformation)
  );
}
