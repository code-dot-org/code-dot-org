export const sourcesKeys = {
  all: ['sources'] as const,

  details: () => [...sourcesKeys.all, 'detail'] as const,
  detail: (channelId: string) => [...sourcesKeys.details(), channelId] as const,

  source: (channelId: string, sourceFile?: string) =>
    [...sourcesKeys.detail(channelId), 'source', sourceFile] as const,
  versionList: (channelId: string, sourceFile?: string) =>
    [...sourcesKeys.detail(channelId), 'versions', sourceFile] as const,
};
