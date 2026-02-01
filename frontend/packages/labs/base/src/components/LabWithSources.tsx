import type {LevelProperties} from '@code-dot-org/core/api';
import type {ProjectSources, ProjectManager} from '@code-dot-org/projects';

import {useMaybeLevelProperties} from '../contexts/LevelPropertiesContext';
import {ProjectProvider} from '../contexts/ProjectContext';
import {SourcesProvider} from '../contexts/SourcesContext';

import Lab from './Lab';
import type {LabProps} from './Lab';

export interface LabWithSourcesProps<
  T extends LevelProperties = LevelProperties,
  U = string,
> extends LabProps {
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
}

const LabWithSourcesWrapper = <
  T extends LevelProperties = LevelProperties,
  U = string,
>({
  defaultSources,
  projectManager,
  getInitialSources,
  startOverSources,
  startOverMessage,
  channelId,
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
      <ProjectProvider channelId={channelId}>{children}</ProjectProvider>
    </SourcesProvider>
  ) : undefined;
};

const LabWithSources = <
  T extends LevelProperties = LevelProperties,
  U = string,
>({
  children,
  ...props
}: LabWithSourcesProps<T, U>) => {
  const {levelId, standaloneProjectType, isLoading} = props;

  return (
    <Lab
      levelId={levelId}
      standaloneProjectType={standaloneProjectType}
      isLoading={isLoading}
    >
      <LabWithSourcesWrapper<T, U> {...props}>{children}</LabWithSourcesWrapper>
    </Lab>
  );
};

export default LabWithSources;
