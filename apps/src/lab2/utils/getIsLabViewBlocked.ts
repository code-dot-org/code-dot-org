export const getIsLabViewBlocked = (
  pageAction: string,
  isBlockedAbuse: boolean,
  projectSharingDisabled: boolean,
  hasPrivacyProfanityViolation: boolean,
  isOwner: boolean,
  isTeacherOfProjectOwner: boolean,
  isProjectValidator: boolean
): boolean => {
  if (
    !isBlockedAbuse &&
    !projectSharingDisabled &&
    !hasPrivacyProfanityViolation
  ) {
    return false;
  }
  // If a project is blocked and in share view,
  // only render the lab view if owner or owner's teacher AND project sharing is disabled.
  // A privacy/profanity violation blocks the lab view for everyone, overriding
  // the owner exemption for disabled sharing.
  if (pageAction === 'share') {
    return projectSharingDisabled &&
      !hasPrivacyProfanityViolation &&
      (isOwner || isTeacherOfProjectOwner)
      ? false
      : true;
  }
  const hasElevatedPrivileges =
    isProjectValidator || isOwner || isTeacherOfProjectOwner;
  // If a project is blocked and in view/edit mode, do not render the lab view if the user does not have view/edit access.
  if (['view', 'edit'].includes(pageAction) && !hasElevatedPrivileges) {
    return true;
  }
  return false;
};
