import type {ComponentType} from 'react';

import {
  useApiClient,
  useAppOptions,
  useLevelProperties,
  type LevelPropertiesRequestParams,
  type LevelPropertiesMap,
} from '@code-dot-org/core/api';

import {useLoadLab} from '../contexts/ProjectContext';
import {useThrowIfPageError} from '../hooks/useThrowIfPageError';

import LabErrorBoundary from './LabErrorBoundary';

/**
 * The prop contract a `@code-dot-org/lab`-based lab entrypoint accepts from a
 * host. The host resolves the level data and identity and passes them down; the
 * lab forwards them to its own `<Lab>` / `<LabWithSources>` and supplies the
 * lab-specific bits (default sources, the lab UI) itself.
 *
 * The host owns the project load entirely (see {@link LabHost}): it resolves
 * level properties and app options and drives the load via `useLoadLab`. The
 * lab does no loading of its own, so neither app options nor the channel id are
 * part of this contract — the channel id is a load input consumed by the host,
 * not drilled through the lab component tree.
 */
export interface LabEntrypointProps {
  /** Whether the host is still resolving level properties / app options. */
  isLoading: boolean;
  /** Current level id (host-resolved; for standalone projects, the map's first key). */
  levelId?: string;
  /** Standalone project type, when not a particular level. */
  standaloneProjectType?: string;
  /** Resolved level-properties map (host-fetched). */
  levelPropertiesMap?: LevelPropertiesMap;
}

/** Props for {@link LabHost}. */
export interface LabHostProps {
  /** The lab entrypoint to render once level data is resolved. */
  LabEntrypoint: ComponentType<LabEntrypointProps>;
  /** Standalone project type for the route (the `$labType` segment). */
  standaloneProjectType: string;
  /** Channel id for the project (the `$channelId` segment). */
  channelId?: string;
  /** Script id, when the project is reached through a unit. */
  scriptId?: number;
  /** User being viewed, e.g. a teacher viewing a student. */
  userId?: number;
}

/**
 * Host-owned loading boundary (the "host dispatches explicitly" model): the
 * host resolves level properties and app options for the route's project,
 * dispatches the load via {@link useLoadLab}, and renders the lab with the
 * resolved level data. The lab does no loading of its own.
 *
 * Shared by the studio host and the standalone lab dev harnesses so there is a
 * single resolve-and-dispatch path. Must be rendered inside the data-provider
 * stack (shared redux store + react-query + API client).
 *
 * Wraps the load in {@link LabErrorBoundary}: the host fetches below throw on
 * failure (via `throwOnError`) and the `loadLab` error is re-thrown by
 * {@link useThrowIfPageError}, so any load failure renders the error page.
 */
export default function LabHost(props: LabHostProps) {
  return (
    <LabErrorBoundary>
      <LabHostContent {...props} />
    </LabErrorBoundary>
  );
}

function LabHostContent({
  LabEntrypoint,
  standaloneProjectType,
  channelId,
  scriptId,
  userId,
}: LabHostProps) {
  const api = useApiClient();

  // The host owns the discriminated request params. Standalone projects are
  // keyed by their project type. `throwOnError` routes fetch failures to the
  // surrounding LabErrorBoundary instead of leaving `isLoading` true forever.
  const params: LevelPropertiesRequestParams = {standaloneProjectType};
  const {data: levelPropertiesMap} = useLevelProperties(api, params, {
    throwOnError: true,
  });

  // Standalone projects carry no level id of their own; resolve it to the first
  // key of the map.
  const levelId = levelPropertiesMap
    ? Number(Object.keys(levelPropertiesMap)[0])
    : undefined;

  const {data: appOptions} = useAppOptions(
    api,
    {levelId: levelId as number},
    {enabled: levelId !== undefined, throwOnError: true},
  );

  const levelProperties =
    levelId !== undefined ? levelPropertiesMap?.[levelId] : undefined;

  // Host drives the load explicitly. `useLoadLab` no-ops until its inputs are
  // present, and `loadLab` short-circuits for labs that do not use projects.
  useLoadLab({
    levelProperties,
    appOptions,
    levelId,
    userId,
    scriptId,
    channelId,
  });

  // Re-throw a failed `loadLab` (recorded in redux) into the boundary.
  useThrowIfPageError();

  return (
    <LabEntrypoint
      isLoading={!levelPropertiesMap || !appOptions}
      standaloneProjectType={standaloneProjectType}
      levelId={levelId !== undefined ? String(levelId) : undefined}
      levelPropertiesMap={levelPropertiesMap}
    />
  );
}
