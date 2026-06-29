import {Box} from '@mui/material';

import {useApiClient, useLevelProperties} from '@code-dot-org/core/api';
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
    ? Object.keys(levelPropertiesMap)[0]
    : undefined;

  return (
    <Box className="oceans-lab-shell">
      <Box className="oceans-lab-frame">
        <OceansLab
          isLoading={!levelPropertiesMap}
          standaloneProjectType="oceans"
          levelId={levelId}
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
