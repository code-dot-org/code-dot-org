import {z} from 'zod';

import {
  MilestoneReportSchema,
  OptionalMilestoneDataSchema,
  UnitProgressDefinitionSchema,
  UnitProgressSchema,
  UserProgressResponseDefinitionSchema,
  UserProgressResponseSchema,
} from './progress.schemata';

// Wire-format types (snake_case). Useful when working with raw payloads
// from interceptors, fixtures, or tests that build inputs by hand.
export type UnitProgressDefinition = z.infer<
  typeof UnitProgressDefinitionSchema
>;
export type UserProgressResponseDefinition = z.infer<
  typeof UserProgressResponseDefinitionSchema
>;

// Consumer-facing types (camelCase). What `api.progress.*` returns.
export type UnitProgress = z.infer<typeof UnitProgressSchema>;
export type UserProgressResponse = z.infer<typeof UserProgressResponseSchema>;

// Request-side types — sent as-is, no transform involved.
export type OptionalMilestoneData = z.infer<typeof OptionalMilestoneDataSchema>;
export type MilestoneReport = z.infer<typeof MilestoneReportSchema>;
