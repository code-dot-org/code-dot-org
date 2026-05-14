import {z} from 'zod';

import {
  MilestoneReportSchema,
  OptionalMilestoneDataSchema,
  UnitProgressDefinitionSchema,
  UserProgressResponseSchema,
} from './progress.schemata';

export type UnitProgressDefinition = z.infer<
  typeof UnitProgressDefinitionSchema
>;
export type OptionalMilestoneData = z.infer<typeof OptionalMilestoneDataSchema>;
export type MilestoneReport = z.infer<typeof MilestoneReportSchema>;
export type UserProgressResponse = z.infer<typeof UserProgressResponseSchema>;
