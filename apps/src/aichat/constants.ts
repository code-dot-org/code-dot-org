export const Role = {
  ASSISTANT: 'assistant' as const,
  USER: 'user' as const,
  SYSTEM: 'system' as const,
};

export const Status = {
  OK: 'ok' as const,
  PERSONAL: 'personal' as const,
  INAPPROPRIATE: 'inappropriate' as const,
  UNKNOWN: 'unknown' as const,
};
