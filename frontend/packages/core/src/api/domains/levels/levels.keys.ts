export const levelsKeys = {
  all: ['levels'] as const,

  lists: () => [...levelsKeys.all, 'list'] as const,
  list: (filters?: unknown) => [...levelsKeys.lists(), {filters}] as const,

  details: () => [...levelsKeys.all, 'detail'] as const,
  detail: (
    id?: number,
    projectType?: string,
    scriptName?: string,
    lessonPosition?: number,
  ) =>
    [
      ...levelsKeys.details(),
      id || projectType || scriptName,
      lessonPosition,
    ] as const,

  properties: (
    id?: number,
    projectType?: string,
    scriptName?: string,
    lessonPosition?: number,
  ) =>
    [
      ...levelsKeys.detail(id, projectType, scriptName, lessonPosition),
      'level_properties',
    ] as const,

  predictResponse: (scriptId: number, levelId: number) =>
    [...levelsKeys.all, 'predictResponse', scriptId, levelId] as const,

  sectionSummary: (sectionId: number, levelId: number) =>
    [...levelsKeys.all, 'sectionSummary', sectionId, levelId] as const,
};
