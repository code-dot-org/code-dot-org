import i18n from '@cdo/locale';
import {LtiSectionSyncResult} from '@cdo/apps/lib/ui/lti/sync/types';

export const getRosterSyncErrorMessage = (syncResult: LtiSectionSyncResult) => {
  switch (syncResult.error) {
    case 'wrong_context':
      return i18n.ltiSectionSyncDialogErrorWrongContext({url: '/'});
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
