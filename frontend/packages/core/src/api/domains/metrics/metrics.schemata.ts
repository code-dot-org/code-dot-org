import {z} from 'zod';

export const MetricUnits = [
  'Seconds',
  'Microseconds',
  'Milliseconds',
  'Bytes',
  'Kilobytes',
  'Megabytes',
  'Gigabytes',
  'Terabytes',
  'Bits',
  'Kilobits',
  'Megabits',
  'Gigabits',
  'Terabits',
  'Percent',
  'Count',
  'Bytes/Second',
  'Kilobytes/Second',
  'Megabytes/Second',
  'Gigabytes/Second',
  'Terabytes/Second',
  'Bits/Second',
  'Kilobits/Second',
  'Megabits/Second',
  'Gigabits/Second',
  'Terabits/Second',
  'Count/Second',
  'None',
] as const;

export const MetricDimensionSchema = z.object({
  name: z.string(),
  value: z.string(),
});

export const MetricDatumSchema = z.object({
  name: z.string(),
  dimensions: z.array(MetricDimensionSchema),
  value: z.number(),
  unit: z.enum(MetricUnits),
});

export const MetricDataSchema = z.array(MetricDatumSchema);
