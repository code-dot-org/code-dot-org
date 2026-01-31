import {z} from 'zod';
import {ChannelSchema, ProjectAndSourcesSchema} from './channels.schemata';

export type Channel = z.infer<typeof ChannelSchema>;
export type ProjectAndSources = z.infer<typeof ProjectAndSourcesSchema>;
