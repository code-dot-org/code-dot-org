export const sectionsKeys = {
  all: ['sections'] as const,

  validCourseOfferings: () =>
    [...sectionsKeys.all, 'validCourseOfferings'] as const,

  availableParticipantTypes: () =>
    [...sectionsKeys.all, 'availableParticipantTypes'] as const,
};
