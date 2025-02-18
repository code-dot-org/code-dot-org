import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import CrosshairOverlay from '@cdo/apps/templates/CrosshairOverlay';
import TooltipOverlay, {
  coordinatesProvider,
} from '@cdo/apps/templates/TooltipOverlay';
import VisualizationOverlay, {
  dispatchResizeEvent,
} from '@cdo/apps/templates/VisualizationOverlay';

import style from './javalab-crosshair-overlay.module.scss';

/**
 * Crosshair overlay with x,y coordinates for Javalab. <JavalabPanels> controls layout scaling
 * when panels are resized, which is why this overlay has a constant width/height by default.
 */
export default function JavalabCrosshairOverlay({
  width = parseInt(style.width),
  height = parseInt(style.height),
  visible = true,
}) {
  // Use SCSS to control visibility to preserve scaling controlled by <JavalabPanels>.
  // Otherwise, unmounting/remounting would reset the scale.
  return (
    <VisualizationOverlay
      className={classNames(style.overlay, !visible && style.hidden)}
      width={width}
      height={height}
    >
      <CrosshairOverlay />
      <TooltipOverlay providers={[coordinatesProvider()]} />
    </VisualizationOverlay>
  );
}

JavalabCrosshairOverlay.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  visible: PropTypes.bool,
};

export function resizeCrosshairOverlay() {
  dispatchResizeEvent();
}

export function showOverlayFromState(state) {
  return (
    !state.javalabView.isVisualizationCollapsed && !state.javalab.isRunning
  );
}
