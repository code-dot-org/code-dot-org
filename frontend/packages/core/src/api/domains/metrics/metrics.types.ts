import {z} from 'zod';

import {
  MetricUnits,
  MetricDimensionSchema,
  MetricDataSchema,
  MetricDatumSchema,
} from './metrics.schemata';

export type MetricUnit = (typeof MetricUnits)[number];
export type MetricData = z.infer<typeof MetricDataSchema>;
export type MetricDatum = z.infer<typeof MetricDatumSchema>;
export type MetricDimension = z.infer<typeof MetricDimensionSchema>;
