export const progressKeys = {
  all: ['progress'] as const,

  userProgress: (scriptName: string, userId?: string | number) =>
    [...progressKeys.all, 'userProgress', scriptName, userId ?? null] as const,
};
