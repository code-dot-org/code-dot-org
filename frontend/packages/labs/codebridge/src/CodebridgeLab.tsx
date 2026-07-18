import type {
  LevelProperties,
  MultiFileSource,
  ProjectSources,
} from '@code-dot-org/core/api';
import {LabWithSources} from '@code-dot-org/lab';
import type {LabWithSourcesProps} from '@code-dot-org/lab';

import {getEmptyProject} from './utils/multiFileSource';

/**
 * Props for {@link CodebridgeLab}. The same as a {@link LabWithSources} keyed to
 * a {@link MultiFileSource}, except `defaultSources` is optional (it defaults to
 * an empty project).
 */
export type CodebridgeLabProps<T extends LevelProperties = LevelProperties> =
  Omit<LabWithSourcesProps<T, MultiFileSource>, 'defaultSources'> & {
    defaultSources?: ProjectSources<MultiFileSource>;
  };

export const STARTOVER_CODEBRIDGE_MESSAGE =
  "This will reset the workspace to its start state and remove all the code you've added or changed.";

/**
 * Parse a serialized source into a typed {@link MultiFileSource}. The server (and
 * mocks) may hand back `source` as a JSON string; an empty string is a new/empty
 * project. Mirrors the `transform` in {@link BlocklyLab}.
 */
const parseSource = (
  sources: ProjectSources<MultiFileSource>,
): ProjectSources<MultiFileSource> => {
  if (typeof sources.source === 'string') {
    return {
      ...sources,
      source: (sources.source
        ? JSON.parse(sources.source)
        : getEmptyProject()) as MultiFileSource,
    };
  }
  return sources;
};

/**
 * A lab whose sources are a multi-file project. The Codebridge counterpart to
 * {@link BlocklyLab}: it specializes {@link LabWithSources} to a
 * {@link MultiFileSource}, so the base `SourcesContext` owns the project and its
 * save path (through `LabRegistry.projectManager`). Consuming labs — Python Lab,
 * later Web Lab 2 — supply their runtime and layouts as children.
 */
const CodebridgeLab = <T extends LevelProperties = LevelProperties>({
  children,
  defaultSources,
  ...props
}: CodebridgeLabProps<T>) => (
  <LabWithSources<T, MultiFileSource>
    {...props}
    defaultSources={defaultSources ?? {source: getEmptyProject()}}
    startOverMessage={props.startOverMessage ?? STARTOVER_CODEBRIDGE_MESSAGE}
    transform={props.transform ?? parseSource}
  >
    {children}
  </LabWithSources>
);

export default CodebridgeLab;
