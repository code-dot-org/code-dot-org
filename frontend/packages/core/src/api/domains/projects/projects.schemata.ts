import {z} from 'zod';

export const AppNames = [
  'unknown',
  'applab',
  'gamelab',
  'weblab',
  'javalab',
  'poetry',
  'spritelab',
  'playlab',
  'aichat',
  'bubble_choice',
  'dance',
  'music',
  'panels',
  'pythonlab',
  'standalone_video',
  'weblab2',
] as const;

export const StandaloneAppNames = [
  'spritelab',
  'story',
  'science',
  'poetry_hoc',
  'poetry',
  'time_capsule',
  'dance',
] as const;

export const ProjectTypes = [
  ...AppNames,
  ...StandaloneAppNames,
  'artist',
  'artist_k1',
  'frozen',
  'minecraft_adventurer',
  'minecraft_hero',
  'minecraft_designer',
  'minecraft_codebuilder',
  'minecraft_aquatic',
  'algebra_game',
  'starwars',
  'starwarsblocks_hour',
  'iceage',
  'infinity',
  'gumball',
  'playlab',
  'playlab_k1',
  'sports',
  'basketball',
] as const;

type ProjectType = (typeof ProjectTypes)[number];

export const OPEN_ENDED_LEGACY_PROJECT_TYPES: ProjectType[] = [
  'applab',
  'gamelab',
  'weblab',
  'javalab',
  'spritelab',
  'poetry',
  'playlab',
] as const;

export const OPEN_ENDED_LAB2_PROJECT_TYPES: ProjectType[] = [
  'pythonlab',
  'weblab2',
] as const;

export const OPEN_ENDED_PROJECTS_YOUNG_AGE: ProjectType[] = [
  'spritelab',
  'poetry',
  'playlab',
] as const;

export const ProjectChannelForLevelSchema = z.object({
  channel: z.string().optional(),
  started: z.boolean().optional(),
  reduceChannelUpdates: z.boolean().optional(),
});

export const ExtraLinksProjectDataSchema = z.object({
  owner_info: z
    .object({
      storage_id: z.number(),
      name: z.string(),
    })
    .optional(),
  project_info: z
    .object({
      id: z.number(),
      sources_link: z.string(),
      is_featured_project: z.boolean(),
      featured_status: z.string(),
      remix_ancestry: z.array(z.string()),
      is_published_project: z.enum(['yes', 'no']),
      abuse_score: z.number(),
    })
    .optional(),
  message: z.string().optional(),
});
