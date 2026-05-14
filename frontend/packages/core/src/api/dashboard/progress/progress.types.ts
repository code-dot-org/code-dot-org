import {z} from 'zod';

import {
  MilestoneReportSchema,
  OptionalMilestoneDataSchema,
  UnitProgressSchema,
  UserProgressResponseSchema,
} from './progress.schemata';

// Consumer-facing types (camelCase). What `api.progress.*` returns —
// the schemas preprocess snake_case wire fields to camelCase before
// validation, so there's no separate "definition" type to expose.
export type UnitProgress = z.infer<typeof UnitProgressSchema>;
export type UserProgressResponse = z.infer<typeof UserProgressResponseSchema>;

// Request-side types — sent as-is, no preprocess involved.
export type OptionalMilestoneData = z.infer<typeof OptionalMilestoneDataSchema>;
export type MilestoneReport = z.infer<typeof MilestoneReportSchema>;
