import i18n from '@cdo/locale';

export const getRosterSyncErrorMessage = (error: string) => {
  switch (error) {
    case 'wrong_context':
      return i18n.ltiSectionSyncDialogErrorWrongContext({url: '/'});
    case 'no_integration':
      return i18n.ltiSectionSyncDialogErrorNoIntegration();
    case 'no_section':
      return i18n.ltiSectionSyncDialogErrorNoSectionFound();
    default:
      return i18n.ltiSectionSyncDialogError();
  }
};
