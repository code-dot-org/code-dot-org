export const channelsKeys = {
  all: ['channels'] as const,

  details: () => [...channelsKeys.all, 'detail'] as const,
  detail: (channelId: string) =>
    [...channelsKeys.details(), channelId] as const,

  abuseScore: (channelId: string) =>
    [...channelsKeys.detail(channelId), 'abuse'] as const,
  sharingDisabled: (channelId: string) =>
    [...channelsKeys.detail(channelId), 'sharing_disabled'] as const,
  isTeacherOfProjectOwner: (channelId: string) =>
    [...channelsKeys.detail(channelId), 'is_teacher_of_project_owner'] as const,
};
