import type {ProjectSources, ProjectManager} from '@code-dot-org/projects';

import {useMaybeLevelProperties} from '../contexts/LevelPropertiesContext';
import {ProjectProvider} from '../contexts/ProjectContext';
import {SourcesProvider} from '../contexts/SourcesContext';
import type {LevelProperties} from '../types';

import Lab from './Lab';
import type {LabProps} from './Lab';

export interface LabWithSourcesProps<
  T extends LevelProperties = LevelProperties,
  U extends ProjectSources = ProjectSources,
> extends LabProps {
  defaultSources: U;
  /**
   * Optionally supply a custom ProjectManager to use in place of the LabRegistry's ProjectManager.
   * Currently only used in very specific multi-project scenarios.
   */
  projectManager?: ProjectManager;
  /** How to determine the initial sources */
  getInitialSources?: (levelProperties: T, projectSources?: U) => U | undefined;
  /** The sources to use when starting over */
  startOverSources?: (levelProperties: T) => U;
  /** The message to display when potentially starting over */
  startOverMessage?: string;
}

const LabWithSourcesWrapper = <
  T extends LevelProperties = LevelProperties,
  U extends ProjectSources = ProjectSources,
>({
  defaultSources,
  projectManager,
  getInitialSources,
  startOverSources,
  startOverMessage,
  channelId,
  children,
}: LabWithSourcesProps<T, U>) => {
  const levelProperties = useMaybeLevelProperties<T>();

  console.log('level?', levelProperties);

  return levelProperties ? (
    <SourcesProvider<T, U>
      levelProperties={levelProperties}
      defaultSources={defaultSources}
      projectManager={projectManager}
      getInitialSources={getInitialSources}
      startOverSources={startOverSources}
      defaultStartOverMessage={startOverMessage}
    >
      <ProjectProvider channelId={channelId}>
        {children}
      </ProjectProvider>
    </SourcesProvider>
  ) : undefined;
};

const LabWithSources = <
  T extends LevelProperties = LevelProperties,
  U extends ProjectSources = ProjectSources,
>({
  children,
  ...props
}: LabWithSourcesProps<T, U>) => {
  const {levelId, isLoading} = props;

  return (
    <Lab
      levelId={levelId}
      isLoading={isLoading}
    >
      <LabWithSourcesWrapper<T, U> {...props}>
        {children}
      </LabWithSourcesWrapper>
    </Lab>
  );
};

export default LabWithSources;
