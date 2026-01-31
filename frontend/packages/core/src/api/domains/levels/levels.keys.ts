export const levelsKeys = {
  all: ['levels'] as const,

  lists: () => [...levelsKeys.all, 'list'] as const,
  list: (filters?: unknown) => [...levelsKeys.lists(), {filters}] as const,

  details: () => [...levelsKeys.all, 'detail'] as const,
  detail: (id: number) => [...levelsKeys.details(), id] as const,

  properties: (id: number) =>
    [...levelsKeys.detail(id), 'level_properties'] as const,
};
