// TanStack Query keys for the accounts module. The current-user key lives in
// core (usersKeys); these are the accounts-owned reads.
export const accountsKeys = {
  all: ['accounts'] as const,
  settings: () => [...accountsKeys.all, 'settings'] as const,
};
