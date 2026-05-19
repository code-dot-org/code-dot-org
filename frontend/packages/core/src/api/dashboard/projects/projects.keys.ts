export const projectsKeys = {
  all: ['projects'] as const,

  channelsForLevel: () => [...projectsKeys.all, 'channelForLevel'] as const,
  channelForLevel: (params: {
    levelId: number;
    scriptId?: number;
    userId?: number;
  }) => [...projectsKeys.channelsForLevel(), params] as const,

  extraLinks: (channelId: string) =>
    [...projectsKeys.all, 'extraLinks', channelId] as const,
};
