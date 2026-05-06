import {Box} from '@mui/material';
import {useCallback, useEffect, useRef, useState} from 'react';

import OceansLab from '@code-dot-org/oceans-lab';

/**
 * Sizing constants mirrored from apps/src/fish/FishView.jsx so the studio
 * path produces the same responsive 16:9 canvas as the curriculum path.
 */
const ASPECT_RATIO = 16 / 9;
const MIN_WIDTH_PX = 320;
const MAX_WIDTH_PX = 1280;
/** Font size (px) at the baseline container width. */
const BASELINE_FONT_SIZE_PX = 18;
/** Container width (px) at which the baseline font size is defined. */
const BASELINE_WIDTH_PX = 930;

/** Computed canvas container dimensions and proportional base font size. */
interface OceansDimensions {
  containerWidth: number;
  containerHeight: number;
  /** Base font size for Radium's %-relative UI styles to cascade from. */
  fontSize: number;
}

/**
 * Compute 16:9 canvas dimensions from the available wrapper area.
 *
 * Mirrors the algorithm in FishView.jsx:
 *   - Clamp width to [MIN_WIDTH_PX, MAX_WIDTH_PX].
 *   - If constrained by height instead (tall viewport), size to fit height.
 *   - Derive font size proportionally so Radium %-based styles scale correctly.
 */
function computeDimensions(
  availableWidth: number,
  availableHeight: number,
): OceansDimensions {
  const maxWidth = Math.min(availableWidth, MAX_WIDTH_PX);

  let containerWidth: number;
  if (availableHeight > 0 && maxWidth / availableHeight > ASPECT_RATIO) {
    containerWidth = availableHeight * ASPECT_RATIO;
  } else {
    containerWidth = maxWidth;
  }

  if (containerWidth < MIN_WIDTH_PX) {
    containerWidth = MIN_WIDTH_PX;
  }

  const containerWidth_ = Math.round(containerWidth);
  const containerHeight = Math.round(containerWidth_ / ASPECT_RATIO);
  const fontSize =
    (BASELINE_FONT_SIZE_PX * containerWidth_) / BASELINE_WIDTH_PX;

  return {containerWidth: containerWidth_, containerHeight, fontSize};
}

/**
 * Studio entry point for the AI for Oceans lab.
 *
 * Wraps OceansLab in a responsive container that mirrors the sizing logic
 * from apps/src/fish/FishView.jsx: 16:9 aspect ratio, clamped between
 * 320 px and 1280 px, centred horizontally. Also sets the proportional base
 * font size so that Radium's %-relative inline styles (counter, buttons, etc.)
 * scale identically to the curriculum path.
 */
export default function OceansContainer() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<OceansDimensions>({
    containerWidth: 0,
    containerHeight: 0,
    fontSize: BASELINE_FONT_SIZE_PX,
  });

  const measure = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const style = getComputedStyle(el);
    const availableWidth =
      el.offsetWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight);
    const availableHeight =
      el.offsetHeight -
      parseFloat(style.paddingTop) -
      parseFloat(style.paddingBottom);
    setDims(computeDimensions(availableWidth, availableHeight));
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <Box
      ref={wrapperRef}
      sx={{
        width: '100%',
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        // Match the ocean-blue body background from the curriculum path
        // (body.oceans-blue { background-color: rgb(2, 0, 28) }).
        backgroundColor: 'rgb(2, 0, 28)',
        // 10px gap above the canvas, matching the curriculum path layout.
        paddingTop: '10px',
        // Side inset so the canvas doesn't bleed to the viewport edge on
        // narrow screens. None needed once the canvas is narrower than the
        // viewport (i.e. wider than ~570px where 16:9 headroom appears).
        px: {xs: 1, sm: 0},
      }}
    >
      {dims.containerWidth > 0 && (
        <Box
          sx={{
            width: dims.containerWidth,
            height: dims.containerHeight,
            position: 'relative',
            fontSize: dims.fontSize,
            // CssBaseline sets box-sizing: border-box globally; Radium's
            // %-based height/padding inside #container-react assumes content-box
            // (matching the curriculum path's Rails defaults). Reset locally.
            '& #container-react, & #container-react *': {
              boxSizing: 'content-box',
            },
          }}
        >
          <OceansLab />
        </Box>
      )}
    </Box>
  );
}
