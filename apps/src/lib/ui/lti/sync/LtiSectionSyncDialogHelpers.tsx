import i18n from '@cdo/locale';

export const getRosterSyncErrorMessage = (error: string) => {
  switch (error) {
    case 'wrong_context':
      return i18n.ltiSectionSyncDialogErrorWrongContext({url: 'example.com'});
    case 'no_integration':
      return i18n.ltiSectionSyncDialogErrorNoIntegration();
    case 'no_section':
      return i18n.ltiSectionSyncDialogErrorNoSectionFound();
  }
};
