import i18n from '@cdo/locale';

export const getRosterSyncErrorMessage = (errorCode: number) => {
  switch (errorCode) {
    case 400:
      return i18n.ltiSectionSyncDialogErrorWrongContext();
    case 401:
      return i18n.ltiSectionSyncDialogErrorNoIntegration();
    case 404:
      return i18n.ltiSectionSyncDialogErrorNoSectionFound();
  }
};

export const getRosterSyncIssuerErrorDetails = (issuer: string) => {
  switch (issuer) {
    case 'Schoology':
      return i18n.ltiSectionSyncDialogErrorSchoologyDetails({
        url: 'example.com',
      });
  }
};
