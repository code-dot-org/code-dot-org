// The student's project: the channel shared by every level that names the
// pathway's template level. Read and written through a manager of its own
// that lives only as long as the component calling usePathwayProject, so a
// step's manager and this one are never live at the same time.

import {useCallback, useMemo} from 'react';

import useSources from '@cdo/apps/lab2/hooks/useSources';
import {Channel, LevelProperties, ProjectSources} from '@cdo/apps/lab2/types';

import {Pathway} from '../types';

// The template level always has start sources; this is never reached.
const NO_SOURCES: ProjectSources = {source: ''};

export interface PathwayProjectState {
  /** The project channel once loaded; undefined while loading or without one. */
  channel?: Channel;
  isLoading: boolean;
  /** False for anyone but the owner, and until the channel has loaded. */
  isEditable: boolean;
  loadError?: Error;
  /** Renames the project and/or replaces the student's description of it. */
  editProject: (edits: {name?: string; description?: string}) => void;
}

export function usePathwayProject(pathway: Pathway): PathwayProjectState {
  // The template level is its own host level, so its channel is the one every
  // project step writes to. Without a resolved template there is no project,
  // which useSources expresses as a level that uses none.
  const templateLevel = useMemo<LevelProperties>(
    () =>
      pathway.project.levelProperties ?? {
        id: 0,
        name: pathway.project.templateLevel,
        appName: 'adaptive',
        usesProjects: false,
      },
    [pathway]
  );
  const {channel, projectManager, isLoading, isEditable, loadError} =
    useSources({levelProperties: templateLevel, defaultSources: NO_SOURCES});

  const editProject = useCallback<PathwayProjectState['editProject']>(
    ({name, description}) => {
      const current = projectManager?.getLastChannel();
      if (!projectManager || !current) return;
      if (name !== undefined) {
        projectManager.rename(name);
      }
      if (description !== undefined) {
        projectManager.updateChannel(
          {
            labConfig: {
              ...current.labConfig,
              adaptive: {...current.labConfig?.adaptive, description},
            },
          },
          true
        );
      }
    },
    [projectManager]
  );

  return {channel, isLoading, isEditable, loadError, editProject};
}
