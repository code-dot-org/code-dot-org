import {z} from 'zod';

import {
  MultiFileSource,
  ProjectFile,
  ProjectFileType,
  ProjectFolder,
} from '@cdo/apps/lab2/types';
import {ViewMode, Weblab2LevelProperties} from '@cdo/apps/weblab2/types';

import {subsetOf} from '../../subsetOf';

const projectFolderSchema = subsetOf<ProjectFolder>()(
  z.strictObject({
    id: z.string().min(1),
    name: z.string().min(1),
    parentId: z.string(),
    open: z.boolean().optional(),
  })
);

const projectFileSchema = subsetOf<ProjectFile>()(
  z.strictObject({
    id: z.string().min(1),
    name: z.string().min(1),
    contents: z.string(),
    active: z.boolean().optional(),
    folderId: z.string(),
    type: z.enum(ProjectFileType).optional(),
    url: z.string().optional(),
    flagged: z.boolean().optional(),
  })
);

/** Web Lab start code, in the same shape the lab stores project sources. */
export const multiFileSourceSchema = subsetOf<MultiFileSource>()(
  z.strictObject({
    folders: z.record(z.string(), projectFolderSchema),
    files: z.record(z.string(), projectFileSchema),
    openFiles: z.array(z.string()).optional(),
  })
);

/** Weblab2-specific step properties: the Web Lab level properties a step may set. */
export const weblab2LabSchema = subsetOf<Partial<Weblab2LevelProperties>>()(
  z.strictObject({
    initialViewMode: z.enum(ViewMode).optional(),
    startSources: multiFileSourceSchema.optional(),
  })
).extend({
  type: z.literal('weblab2'),
});
