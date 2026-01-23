import type {ProjectSources, ProjectManager} from '@code-dot-org/projects';

import {SourcesProvider} from '../contexts/SourcesContext';
import type {LevelProperties} from '../types';

import Lab from './Lab';
import type {LabProps} from './Lab';

export interface LabWithSourcesProps<
  T extends LevelProperties = LevelProperties,
  U extends ProjectSources = ProjectSources,
> extends LabProps<T> {
  defaultSources: U;
  /**
   * Optionally supply a custom ProjectManager to use in place of the LabRegistry's ProjectManager.
   * Currently only used in very specific multi-project scenarios.
   */
  projectManager?: ProjectManager;
  /** How to determine the initial sources */
  getInitialSources?: (levelProperties: T, projectSources?: U) => U | undefined;
  /** The sources to use when starting over */
  startOverSources?: U;
}

const LabWithSources = <
  T extends LevelProperties = LevelProperties,
  U extends ProjectSources = ProjectSources,
>({
  levelProperties,
  levelId,
  isLoading,
  defaultSources,
  projectManager,
  getInitialSources,
  startOverSources,
  children,
}: LabWithSourcesProps<T, U>) => (
  <Lab
    levelProperties={levelProperties}
    levelId={levelId}
    isLoading={isLoading}
  >
    <SourcesProvider<T, U>
      levelProperties={levelProperties}
      defaultSources={defaultSources}
      projectManager={projectManager}
      getInitialSources={getInitialSources}
      startOverSources={startOverSources}
    >
      {children}
    </SourcesProvider>
  </Lab>
);

export default LabWithSources;
