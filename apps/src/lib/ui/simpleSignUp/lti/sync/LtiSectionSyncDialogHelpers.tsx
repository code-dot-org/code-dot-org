import {LtiSectionSyncResult} from '@cdo/apps/lib/ui/simpleSignUp/lti/sync/types';
import i18n from '@cdo/locale';

export const getRosterSyncErrorMessage = (syncResult: LtiSectionSyncResult) => {
  switch (syncResult.error) {
    case 'wrong_context':
      return i18n.ltiSectionSyncDialogErrorWrongContext({
        url: 'https://support.code.org/hc/en-us/articles/23622036958093-Create-and-sync-rosters-with-Schoology',
      });
    case 'no_integration':
      return i18n.ltiSectionSyncDialogErrorNoIntegration();
    case 'no_section':
      return i18n.ltiSectionSyncDialogErrorNoSectionFound();
    default:
      return syncResult.message
        ? syncResult.message
        : i18n.ltiSectionSyncDialogError();
  }
};
