import {Box} from '@mui/material';

import OceansLab from '@code-dot-org/oceans-lab';
import '@code-dot-org/oceans-lab/styles.css';

/**
 * Studio entry point for the AI for Oceans lab.
 *
 * Wraps OceansLab in a CSS-only responsive shell that mirrors the FishView
 * curriculum-path layout: 16:9 box, clamped between 320 px and 1280 px,
 * proportional base font size.  The sizing rules live in oceans-lab's CSS;
 * vite library mode emits them to dist/oceans-lab.css and we import that
 * subpath explicitly so studio's bundle picks them up.
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
