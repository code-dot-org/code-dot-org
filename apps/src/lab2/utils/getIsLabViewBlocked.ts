export const getIsLabViewBlocked = (
  pageAction: string,
  isBlockedAbuse: boolean,
  projectSharingDisabled: boolean,
  isOwner: boolean,
  isTeacherOfProjectOwner: boolean,
  isProjectValidator: boolean
): boolean => {
  if (!isBlockedAbuse && !projectSharingDisabled) {
    return false;
  }
  // If a project is blocked and in share view,
  // only render the lab view if owner or owner's teacher AND project sharing is disabled.
  if (pageAction === 'share') {
    return projectSharingDisabled && (isOwner || isTeacherOfProjectOwner)
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
