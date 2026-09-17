import Slider from '@code-dot-org/component-library/slider';
import {Button as MuiButton, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';

import {KioskElementType} from './constants';
import {KioskElement, KioskEvent, KioskScene} from './types';

import moduleStyles from './kiosk.module.scss';

interface KioskVisualizationProps {
  scene: KioskScene;
  onElementEvent: (event: KioskEvent) => void;
}

interface KioskSliderProps {
  element: KioskElement;
  onElementEvent: (event: KioskEvent) => void;
}

// Coordinates arrive as percentages of the screen, which the stylesheet reads
// back off the element. They are the one value that cannot be a class.
function positionOf(element: KioskElement) {
  return {
    '--kiosk-x': `${element.x}%`,
    '--kiosk-y': `${element.y}%`,
  } as React.CSSProperties;
}

// A slider moves continuously while it is dragged, but the program on the other
// end handles one event at a time and is blocked until it does. Sending every
// step would flood a channel that carries one, so the handle follows the pointer
// locally and only where it comes to rest is sent.
const KioskSlider: React.FunctionComponent<KioskSliderProps> = ({
  element,
  onElementEvent,
}) => {
  const publishedValue = element.value ?? 0;
  const [value, setValue] = useState(publishedValue);

  // The program can move the handle itself, so follow what it last published.
  useEffect(() => setValue(publishedValue), [publishedValue]);

  const commit = () => {
    if (value !== publishedValue) {
      onElementEvent({id: element.id, value});
    }
  };

  return (
    <Slider
      className={moduleStyles.fluidSlider}
      name={element.id}
      label={element.text}
      value={value}
      minValue={element.min ?? 0}
      maxValue={element.max ?? 100}
      onChange={event => setValue(Number(event.target.value))}
      // The resting place, however the handle got there: released after a drag,
      // or left alone after the arrow keys moved it.
      onPointerUp={commit}
      onKeyUp={commit}
      onBlur={commit}
    />
  );
};

// The screen a kiosk program published. Elements are drawn in the order the
// program added them, which is also the order the keyboard tabs through them.
const KioskVisualization: React.FunctionComponent<KioskVisualizationProps> = ({
  scene,
  onElementEvent,
}) => (
  <div className={moduleStyles.kioskContainer}>
    {scene.elements.map(element => {
      const position = positionOf(element);
      if (element.type === KioskElementType.BUTTON) {
        return (
          <div
            key={element.id}
            className={moduleStyles.element}
            style={position}
          >
            <MuiButton
              variant="contained"
              color="primary"
              size="small"
              onClick={() => onElementEvent({id: element.id})}
              type="button"
            >
              {element.text}
            </MuiButton>
          </div>
        );
      }
      if (element.type === KioskElementType.SLIDER) {
        return (
          <div
            key={element.id}
            className={`${moduleStyles.element} ${moduleStyles.sliderElement}`}
            style={position}
          >
            <KioskSlider element={element} onElementEvent={onElementEvent} />
          </div>
        );
      }
      return (
        // A handler can change what a label says, so each one announces its own
        // changes rather than the whole screen re-announcing itself.
        <div
          key={element.id}
          className={moduleStyles.element}
          style={position}
          aria-live="polite"
        >
          <Typography variant="body2" className={moduleStyles.label}>
            {element.text}
          </Typography>
        </div>
      );
    })}
  </div>
);

export default KioskVisualization;
