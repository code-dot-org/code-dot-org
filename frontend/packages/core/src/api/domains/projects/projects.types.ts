import {AppNames, StandaloneAppNames, ProjectTypes} from './projects.schemata';

export type AppName = (typeof AppNames)[number];
export type StandaloneAppName = (typeof StandaloneAppNames)[number];
export type ProjectType = (typeof ProjectTypes)[number];
