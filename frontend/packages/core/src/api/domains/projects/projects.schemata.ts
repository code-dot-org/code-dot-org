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

export const ProjectChannelForLevelSchema = z.object({
  channel: z.string().optional(),
  started: z.boolean().optional(),
  reduceChannelUpdates: z.boolean().optional(),
});
