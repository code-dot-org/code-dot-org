import {z} from 'zod';

import {ProjectTypes} from '../projects';
import {ProjectSourcesSchema} from '../sources';

/**
 * Identifies a project.
 *
 * Corresponds to the "value" JSON column for the entry in the projects table.
 */
export const ChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  isOwner: z.boolean(),
  projectType: z.enum(ProjectTypes),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  hidden: z.boolean().optional(),
  thumbnailUrl: z.string().optional(),
  frozen: z.boolean().optional(),
  // Optional lab-specific configuration for this project.  If provided, this will be saved
  // to the Project model in the database along with the other entries in this interface,
  // inside the value field JSON.
  labConfig: z.record(z.string(), z.record(z.string(), z.string())).optional(),
});

/**
 * A project and its corresponding sources if present, fetched together when
 * loading a level.
 */
export const ProjectAndSourcesSchema = z.object({
  // When projects are loaded for the first time, sources may not be present
  sources: ProjectSourcesSchema.optional(),
  channel: ChannelSchema,
  abuseScore: z.number().optional(),
  sharingDisabled: z.boolean().optional(),
  isTeacherOfProjectOwner: z.boolean().optional(),
});

/**
 * Just the basic return from the .../abuse endpoint.
 */
export const AbuseScoreSchema = z.object({
  abuse_score: z.number(),
});

/**
 * Just the basic return from the .../sharing_disabled endpoint.
 */
export const SharingDisabledSchema = z.object({
  sharing_disabled: z.boolean(),
});

/**
 * Just the basic return from the .../is_teacher_of_project_owner endpoint.
 */
export const IsTeacherOfProjectOwnerSchema = z.object({
  is_teacher_of_project_owner: z.boolean(),
});
