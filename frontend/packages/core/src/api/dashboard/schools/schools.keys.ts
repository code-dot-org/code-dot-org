export const schoolsKeys = {
  all: ['schools'] as const,

  zipSearch: (zip: string) => [...schoolsKeys.all, 'zipSearch', zip] as const,
};
