export const sectionsKeys = {
  all: ['sections'] as const,

  list: () => [...sectionsKeys.all, 'list'] as const,

  validCourseOfferings: () =>
    [...sectionsKeys.all, 'validCourseOfferings'] as const,

  availableParticipantTypes: () =>
    [...sectionsKeys.all, 'availableParticipantTypes'] as const,
};
