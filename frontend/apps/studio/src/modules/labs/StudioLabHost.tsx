import type {ComponentType} from 'react';

import {
  useApiClient,
  useAppOptions,
  useLevelProperties,
  type LevelPropertiesRequestParams,
} from '@code-dot-org/core/api';
import {useLoadLab} from '@code-dot-org/lab/contexts';

import type {LabEntrypointProps} from './types/labEntrypoint';

/** Props for {@link StudioLabHost}. */
interface StudioLabHostProps {
  /** The base-built lab entrypoint to render once data is resolved. */
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
 * Host-owned loading boundary (the "studio dispatches explicitly" model):
 * studio resolves level properties and app options for the route's project,
 * dispatches the load via {@link useLoadLab}, and renders the lab with the
 * resolved data plus `manageLoadExternally` so the lab does not also self-load.
 *
 * Must be rendered inside `LabProviders` (store + react-query + API client).
 */
export default function StudioLabHost({
  LabEntrypoint,
  standaloneProjectType,
  channelId,
  scriptId,
  userId,
}: StudioLabHostProps) {
  const api = useApiClient();

  // Studio owns the discriminated request params (the union that previously
  // lived inside the lab package).
  const params: LevelPropertiesRequestParams = {standaloneProjectType};
  const {
    data: levelPropertiesMap,
    isError,
    error,
  } = useLevelProperties(api, params);
  console.log('map', isError, error, levelPropertiesMap);

  // Standalone projects carry no level id of their own; resolve it to the first
  // key of the map, matching what the lab package did internally before.
  const levelId = levelPropertiesMap
    ? Number(Object.keys(levelPropertiesMap)[0])
    : undefined;

  const {data: appOptions} = useAppOptions(
    api,
    {levelId: levelId as number},
    {enabled: levelId !== undefined},
  );

  const levelProperties =
    levelId !== undefined ? levelPropertiesMap?.[levelId] : undefined;

  console.log('level props', levelProperties, levelId, channelId);

  // Host drives the load explicitly.
  useLoadLab({
    levelProperties,
    appOptions,
    levelId,
    userId,
    scriptId,
    channelId,
  });

  return (
    <LabEntrypoint
      isLoading={!levelPropertiesMap || !appOptions}
      standaloneProjectType={standaloneProjectType}
      channelId={channelId}
      levelId={levelId !== undefined ? String(levelId) : undefined}
      levelPropertiesMap={levelPropertiesMap}
      appOptions={appOptions}
      manageLoadExternally
    />
  );
}
