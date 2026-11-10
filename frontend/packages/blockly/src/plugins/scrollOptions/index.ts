import {ScrollOptions} from '@blockly/plugin-scroll-options';

import {createInjectPlugin} from '..';
import {initializeScrollbarPair} from './scrollbar';

/**
 * Inject plugin that enables scroll-options panning and makes the workspace
 * scrollbars auto-hide.
 *
 * Pairs with the `blockDragger: ScrollBlockDragger` and
 * `metricsManager: TopLeftMetricsManager` inject options (which must be set at
 * injection, so they stay in the workspace options rather than here):
 *
 * - `onInit` wires the ScrollOptions plugin (mouse-wheel + drag-to-edge
 *   scrolling), so the workspace can be panned.
 * - `onReady` runs after the workspace lays out (metrics are valid then) and
 *   unpairs the scrollbars so Blockly can hide either one when its content fits
 *   — see {@link initializeScrollbarPair}.
 *
 * Mirrors legacy `apps/src/blockly/blocklyWrapper.ts`'s post-inject scroll setup.
 */
const scrollOptionsPlugin = createInjectPlugin({
  onInit: workspace => {
    // Match legacy: activate block-based scrolling from the cursor, not the
    // block edge (oversizeBlockThreshold: 0).
    new ScrollOptions(workspace).init({
      edgeScrollOptions: {oversizeBlockThreshold: 0},
    });
  },
  onReady: workspace => {
    initializeScrollbarPair(workspace);
  },
});

export default scrollOptionsPlugin;
