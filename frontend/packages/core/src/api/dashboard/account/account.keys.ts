export const accountKeys = {
  all: ['account'] as const,
  settings: () => [...accountKeys.all, 'settings'] as const,
};
