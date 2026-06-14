export const accountsKeys = {
  all: ['accounts'] as const,
  settings: () => [...accountsKeys.all, 'settings'] as const,
};
