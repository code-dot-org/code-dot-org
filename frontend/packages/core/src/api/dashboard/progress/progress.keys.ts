export const progressKeys = {
  all: ['progress'] as const,

  /**
   * The user-progress endpoint is keyed by scriptName plus an optional
   * userId. The userId path is used when a teacher "views as" a specific
   * student — the cached entries should not collide with the
   * current-user fetch for the same script.
   */
  userProgress: (scriptName: string, userId?: string) =>
    [...progressKeys.all, 'userProgress', scriptName, userId] as const,
};
