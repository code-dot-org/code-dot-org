// The student's project, as a placeholder channel. Held in component state for
// now. Fields we cannot know yet are stubbed.

import {useCallback, useState} from 'react';

import {Channel} from '@cdo/apps/lab2/types';

import {Pathway} from '../types';

const STUB_TIMESTAMP = new Date(0).toISOString();

/** The student's description of their project, kept in the channel's lab config. */
export const projectDescription = (project: Channel): string =>
  project.labConfig?.adaptive?.description ?? '';

/** A not-yet-created project for the pathway's lab. */
const placeholderProject = (pathway: Pathway): Channel => ({
  id: '',
  name: 'My Website',
  isOwner: true,
  projectType: pathway.project.lab.type,
  publishedAt: null,
  createdAt: STUB_TIMESTAMP,
  updatedAt: STUB_TIMESTAMP,
  labConfig: {
    adaptive: {description: 'Add details about your project vision here!'},
  },
});

/** The parts of the project a student edits from the project card. */
export interface ProjectEdits {
  name?: string;
  description?: string;
}

export function useProject(pathway: Pathway) {
  const [project, setProject] = useState<Channel>(() =>
    placeholderProject(pathway)
  );

  const editProject = useCallback(({name, description}: ProjectEdits) => {
    setProject(p => ({
      ...p,
      ...(name !== undefined && {name}),
      ...(description !== undefined && {
        labConfig: {
          ...p.labConfig,
          adaptive: {...p.labConfig?.adaptive, description},
        },
      }),
    }));
  }, []);

  const reset = useCallback(
    () => setProject(placeholderProject(pathway)),
    [pathway]
  );

  return {project, editProject, reset};
}
