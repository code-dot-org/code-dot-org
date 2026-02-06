export const usersKeys = {
  all: ['users'] as const,

  // GET queries
  currentUser: () => [...usersKeys.all, 'currentUser'] as const,
  signedIn: () => [...usersKeys.all, 'signedIn'] as const,
  netsimSignedIn: () => [...usersKeys.all, 'netsimSignedIn'] as const,
  schoolName: () => [...usersKeys.all, 'schoolName'] as const,
  contactDetails: () => [...usersKeys.all, 'contactDetails'] as const,
  donorTeacherBannerDetails: () =>
    [...usersKeys.all, 'donorTeacherBannerDetails'] as const,
  tosVersion: () => [...usersKeys.all, 'tosVersion'] as const,
  currentPermissions: () => [...usersKeys.all, 'currentPermissions'] as const,
  hasDismissedPersonalizationAlert: () =>
    [...usersKeys.all, 'hasDismissedPersonalizationAlert'] as const,
};
