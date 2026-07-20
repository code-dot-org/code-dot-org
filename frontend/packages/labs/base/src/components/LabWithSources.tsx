import type {ReactNode} from 'react';

import type {LevelProperties} from '@code-dot-org/core/api';

import {useMaybeLevelProperties} from '../contexts/LevelPropertiesContext';
import {ProjectProvider} from '../contexts/ProjectContext';
import {SourcesProvider} from '../contexts/SourcesContext';
import type {ProjectSources, ProjectManager} from '../projects';

/**
 * The sources layer a lab renders inside the host's `<Lab>`. It reads the level
 * properties the host published to context (`useMaybeLevelProperties`), loads
 * the project's sources for them, and provides the sources/project contexts to
 * the lab UI.
 *
 * It does NOT render `<Lab>` itself: the host (see `LabHost`) owns the single
 * `<Lab>` wrapper at the top of the tree and this reads what it needs from that
 * context. That is what keeps a lab from double-wrapping `<Lab>` when the studio
 * host already provides one.
 */
export interface LabWithSourcesProps<
  T extends LevelProperties = LevelProperties,
  U = string,
> {
  defaultSources: ProjectSources<U>;
  /**
   * Optionally supply a custom ProjectManager to use in place of the LabRegistry's ProjectManager.
   * Currently only used in very specific multi-project scenarios.
   */
  projectManager?: ProjectManager;
  /** How to determine the initial sources */
  getInitialSources?: (
    levelProperties: T,
    projectSources?: ProjectSources<U>,
  ) => ProjectSources<U> | undefined;
  /** The sources to use when starting over */
  startOverSources?: (levelProperties: T) => ProjectSources<U>;
  /** The message to display when potentially starting over */
  startOverMessage?: string;
  /** A transformer to parse the sources into the typed ProjectSources form expected */
  transform?: (projectSources: ProjectSources<U>) => ProjectSources<U>;
  children?: ReactNode;
}

const LabWithSources = <
  T extends LevelProperties = LevelProperties,
  U = string,
>({
  defaultSources,
  projectManager,
  getInitialSources,
  startOverSources,
  startOverMessage,
  transform,
  children,
}: LabWithSourcesProps<T, U>) => {
  const levelProperties = useMaybeLevelProperties<T>();

  return levelProperties ? (
    <SourcesProvider<T, U>
      levelProperties={levelProperties}
      defaultSources={defaultSources}
      projectManager={projectManager}
      getInitialSources={getInitialSources}
      startOverSources={startOverSources}
      defaultStartOverMessage={startOverMessage}
      transform={transform}
    >
      <ProjectProvider>{children}</ProjectProvider>
    </SourcesProvider>
  ) : undefined;
};

export default LabWithSources;
