import type {ComponentType} from 'react';

import {
  useApiClient,
  useAppOptions,
  useLevelProperties,
  type LevelPropertiesRequestParams,
} from '@code-dot-org/core/api';

import {useLoadLab} from '../contexts/ProjectContext';
import {useThrowIfPageError} from '../hooks/useThrowIfPageError';

import Lab from './Lab';
import LabErrorBoundary from './LabErrorBoundary';

/**
 * The prop contract a `@code-dot-org/lab`-based lab entrypoint accepts from a
 * host. The host resolves the level data and identity and passes them down; the
 * lab reads them from the `<Lab>` context this host renders and supplies the
 * lab-specific bits (default sources, the lab UI) itself.
 *
 * The host owns the project load entirely (see {@link LabHost}): it resolves
 * level properties and app options and drives the load via `useLoadLab`. The
 * lab does no loading of its own, so neither app options nor the channel id are
 * part of this contract — the channel id is a load input consumed by the host,
 * not drilled through the lab component tree.
 */
export type LabEntrypointProps = Record<string, never>;

/** Inputs shared by both level-identification modes. */
interface LabHostBaseProps {
  /** The lab entrypoint to render once level data is resolved. */
  LabEntrypoint: ComponentType;
  /** Channel id for the project, if known (e.g. the `$channelId` segment). */
  channelId?: string;
  /** User being viewed, e.g. a teacher viewing a student. */
  userId?: number;
}

/**
 * A standalone project route (`/projects/$labType/$channelId`). The level is
 * identified by its project type; it carries no level id of its own, so the
 * host resolves the id to the first key of the level-properties map.
 */
export interface ProjectLabHostProps extends LabHostBaseProps {
  standaloneProjectType: string;
  levelId?: never;
  scriptId?: never;
  scriptName?: never;
  lessonPosition?: never;
}

/**
 * A level within a unit/script. The level id is known directly; `scriptName`
 * and `lessonPosition` widen the level-properties fetch to the whole lesson,
 * and `scriptId` scopes the load (predict responses, per-level project manager).
 */
export interface UnitLabHostProps extends LabHostBaseProps {
  standaloneProjectType?: never;
  /** The level id (known directly for unit levels). */
  levelId: number;
  /** Script id, when the level is part of a unit. */
  scriptId?: number;
  /** Script name, to fetch level properties across the lesson. */
  scriptName?: string;
  /** Lesson position within the script. */
  lessonPosition?: number;
}

/** Props for {@link LabHost}: standalone project, or a level within a unit. */
export type LabHostProps = ProjectLabHostProps | UnitLabHostProps;

/**
 * Host-owned loading boundary (the "host dispatches explicitly" model): the
 * host resolves level properties and app options for the level, dispatches the
 * load via {@link useLoadLab}, and renders the lab with the resolved level
 * data. The lab does no loading of its own.
 *
 * Handles both level-identification modes: a standalone project
 * ({@link ProjectLabHostProps}) or a level within a unit
 * ({@link UnitLabHostProps}). The only differences are how the level-properties
 * request is keyed and where the level id comes from; everything downstream
 * (app options, the load dispatch) is the same.
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

function LabHostContent(props: LabHostProps) {
  const {LabEntrypoint, channelId, userId} = props;
  const api = useApiClient();

  // The host owns the discriminated request params: a standalone project is
  // keyed by its project type; a unit level is keyed by its id (widened to the
  // lesson by scriptName/lessonPosition). `throwOnError` routes fetch failures
  // to the surrounding LabErrorBoundary instead of leaving `isLoading` true.
  // (The `!== undefined` checks stay inline so TS narrows `props` per branch.)
  // Mirror getLevelPropertiesUrl's own scoping: a unit level with both
  // scriptName and lessonPosition is fetched lesson-wide (`/s/.../lessons/...`),
  // and levelId only indexes into the result — so it must NOT go in the params,
  // or it pollutes the react-query key and misses the lesson-shared cache a
  // course-level route loader populated. Fall back to keying by levelId only
  // when the lesson coordinates are absent.
  const params: LevelPropertiesRequestParams =
    props.standaloneProjectType !== undefined
      ? {standaloneProjectType: props.standaloneProjectType}
      : props.scriptName !== undefined && props.lessonPosition !== undefined
        ? {scriptName: props.scriptName, lessonPosition: props.lessonPosition}
        : {levelId: props.levelId};
  const {data: levelPropertiesMap} = useLevelProperties(api, params, {
    throwOnError: true,
  });

  // A unit level is identified by the id we were given; a standalone project
  // carries none of its own, so resolve it to the first key of the map.
  const givenLevelId =
    props.standaloneProjectType !== undefined ? undefined : props.levelId;
  const levelId =
    givenLevelId ??
    (levelPropertiesMap
      ? Number(Object.keys(levelPropertiesMap)[0])
      : undefined);

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
    scriptId:
      props.standaloneProjectType !== undefined ? undefined : props.scriptId,
    channelId,
  });

  // Re-throw a failed `loadLab` (recorded in redux) into the boundary.
  useThrowIfPageError();

  // The single `<Lab>` for the whole tree lives here, at the host. It publishes
  // the resolved level data to context; the entrypoint and its LabWithSources
  // read it rather than receiving props, so nothing double-wraps `<Lab>`.
  return (
    <Lab
      isLoading={!levelPropertiesMap || !appOptions}
      standaloneProjectType={props.standaloneProjectType}
      levelId={levelId}
      levelPropertiesMap={levelPropertiesMap}
    >
      <LabEntrypoint />
    </Lab>
  );
}
