import {z} from 'zod';

import {
  AppNames,
  ExtraLinksProjectDataSchema,
  StandaloneAppNames,
  ProjectTypes,
} from './projects.schemata';

export type AppName = (typeof AppNames)[number];
export type StandaloneAppName = (typeof StandaloneAppNames)[number];
export type ProjectType = (typeof ProjectTypes)[number];

export type ExtraLinksProjectData = z.infer<typeof ExtraLinksProjectDataSchema>;
