import {z} from 'zod';

/** One scene in a section-mate's project, as the scene dropdown lists it. */
export const ExternalSceneRefSchema = z.object({
  channel: z.string(),
  sceneId: z.string(),
  sceneName: z.string(),
  ownerName: z.string(),
});

export const SectionScenesResponseSchema = z.object({
  scenes: z.array(ExternalSceneRefSchema).default([]),
});

/**
 * A section-mate's project, as much of it as running its scenes needs. The
 * scenes and animations are Sprite Lab's own source format, which that
 * package types; here they pass through unchecked.
 */
export const ExternalScenesResponseSchema = z.object({
  scenes: z.array(z.unknown()).default([]),
  animations: z.unknown(),
  ownerName: z.string(),
});
