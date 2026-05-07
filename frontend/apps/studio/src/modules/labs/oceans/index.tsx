import {Box} from '@mui/material';

import OceansLab from '@code-dot-org/oceans-lab';

/**
 * Studio entry point for the AI for Oceans lab.
 *
 * Wraps OceansLab in a CSS-only responsive shell that mirrors the FishView
 * curriculum-path layout: 16:9 box, clamped between 320 px and 1280 px,
 * proportional base font size.  The sizing rules live in oceans-lab's CSS
 * (auto-imported via the package entry) and use cqi/cqb so the lab tracks
 * any nearest container's size, falling back to small viewport units when
 * no ancestor has container-type set.
 */
export default function OceansContainer() {
  return (
    <Box className="oceans-lab-shell">
      <Box className="oceans-lab-frame">
        <OceansLab />
      </Box>
    </Box>
  );
}
