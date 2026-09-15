import {Button as MuiButton, Typography} from '@mui/material';
import React from 'react';

import {KioskElementType} from './constants';
import {KioskElement, KioskScene} from './types';

import moduleStyles from './kiosk.module.scss';

interface KioskVisualizationProps {
  scene: KioskScene;
  onElementClick: (elementId: string) => void;
}

// Coordinates arrive as percentages of the screen, which the stylesheet reads
// back off the element. They are the one value that cannot be a class.
function positionOf(element: KioskElement) {
  return {
    '--kiosk-x': `${element.x}%`,
    '--kiosk-y': `${element.y}%`,
  } as React.CSSProperties;
}

// The screen a kiosk program published. Elements are drawn in the order the
// program added them, which is also the order the keyboard tabs through them.
const KioskVisualization: React.FunctionComponent<KioskVisualizationProps> = ({
  scene,
  onElementClick,
}) => (
  <div className={moduleStyles.kioskContainer}>
    {scene.elements.map(element =>
      element.type === KioskElementType.BUTTON ? (
        <div
          key={element.id}
          className={moduleStyles.element}
          style={positionOf(element)}
        >
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            onClick={() => onElementClick(element.id)}
            type="button"
          >
            {element.text}
          </MuiButton>
        </div>
      ) : (
        // A handler can change what a label says, so each one announces its own
        // changes rather than the whole screen re-announcing itself.
        <div
          key={element.id}
          className={moduleStyles.element}
          style={positionOf(element)}
          aria-live="polite"
        >
          <Typography variant="body2" className={moduleStyles.label}>
            {element.text}
          </Typography>
        </div>
      )
    )}
  </div>
);

export default KioskVisualization;
