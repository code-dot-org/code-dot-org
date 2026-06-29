import {Box} from '@mui/material';

import {
  useApiClient,
  useAppOptions,
  useLevelProperties,
} from '@code-dot-org/core/api';
import {useLoadLab} from '@code-dot-org/lab/contexts';
import OceansLab from '@code-dot-org/oceans-lab';
import '@code-dot-org/oceans-lab/styles.css';

import LabProviders from '@/modules/labs/LabProviders';

/**
 * Resolves the oceans level-properties map (host-owned) and renders the
 * base-built OceansLab with it. AI for Oceans is a standalone, no-sources
 * activity, so the host only resolves level properties — there is no project
 * to load. The CSS-only responsive shell mirrors the FishView curriculum-path
 * layout (16:9, clamped, proportional font size).
 */
function OceansHosted() {
  const api = useApiClient();
  const {data: levelPropertiesMap} = useLevelProperties(api, {
    standaloneProjectType: 'oceans',
  });

  // Standalone projects carry no level id of their own; use the map's first key.
  const levelId = levelPropertiesMap
    ? Number(Object.keys(levelPropertiesMap)[0])
    : undefined;

  const {data: appOptions} = useAppOptions(
    api,
    {levelId: levelId as number},
    {enabled: levelId !== undefined},
  );

  const levelProperties =
    levelId !== undefined ? levelPropertiesMap?.[String(levelId)] : undefined;

  // Host drives the load explicitly. Oceans is no-sources (usesProjects:false),
  // so loadLab short-circuits the project load but still populates
  // state.lab.levelProperties — which base lesson progression (the activity's
  // onContinue) reads.
  useLoadLab({levelProperties, appOptions, levelId});

  return (
    <Box className="oceans-lab-shell">
      <Box className="oceans-lab-frame">
        <OceansLab
          isLoading={!levelPropertiesMap || !appOptions}
          standaloneProjectType="oceans"
          levelId={levelId !== undefined ? String(levelId) : undefined}
          levelPropertiesMap={levelPropertiesMap}
        />
      </Box>
    </Box>
  );
}

/**
 * Studio entry point for the AI for Oceans lab. Provides the base data-provider
 * stack (store / react-query / API client) at the lab boundary, then resolves
 * and renders the lab.
 */
export default function OceansContainer() {
  return (
    <LabProviders>
      <OceansHosted />
    </LabProviders>
  );
}
