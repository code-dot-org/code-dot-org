import {z} from 'zod';

/**
 * Project file types are as follows:
 * Starter: Files that come from level start code that are editable by the user.
 * Support: Files that come from level start code that are hidden and not editable by the user.
 * Validation: The file that contain the level's validation code, which is a code file that will be
 * run by the lab. This file is hidden from users.
 * Locked Starter: Files that come from level start code that are editable by the user, but cannot be
 *  deleted or renamed.
 * System Support: Files that are used for running code and for share/remix, but are hidden from the user.
 *  For example, the serialized maze for a neighborhood level.
 */
export const ProjectFileTypes = {
  STARTER: 'starter',
  SUPPORT: 'support',
  VALIDATION: 'validation',
  LOCKED_STARTER: 'locked_starter',
  SYSTEM_SUPPORT: 'system_support',
} as const;

export const FolderIdSchema = z.string();
export const FileIdSchema = z.string();

export const ProjectFolderSchema = z.object({
  id: FolderIdSchema,
  name: z.string(),
  parentId: z.string(),
  open: z.boolean().optional(),
});

export const ProjectFileSchema = z.object({
  id: FileIdSchema,
  name: z.string(),
  language: z.string(),
  contents: z.string(),
  open: z.boolean().optional(),
  active: z.boolean().optional(),
  folderId: FolderIdSchema,
  type: z.enum(Object.values(ProjectFileTypes)).optional(),
});

export const MultiFileSourceSchema = z.object({
  folders: z.record(FolderIdSchema, ProjectFolderSchema),
  files: z.record(FileIdSchema, ProjectFileSchema),
  openFiles: z.array(FileIdSchema).optional(),
});

export const ProjectVersionSchema = z.object({
  versionId: z.string(),
  lastModified: z.string(),
  isLatest: z.boolean(),
  comment: z.string().optional(),
});

export const ProjectVersionListSchema = z.array(ProjectVersionSchema);

export const ProjectSourcesSchema = z.object({
  source: z.union([z.string(), MultiFileSourceSchema]),
  labConfig: z.record(z.string(), z.record(z.string(), z.string())).optional(),
});

export const SourcesUpdateResponseSchema = z.object({
  timestamp: z.string().nullable(),
  versionId: z.string(),
});

export const SourcesRestoreResponseSchema = z.object({
  version_id: z.string().optional(),
});
