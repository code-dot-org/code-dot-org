import {createTheme, ThemeProvider} from '@mui/material/styles';
import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {KioskElementType} from '@cdo/apps/miniApps/kiosk/constants';
import KioskVisualization from '@cdo/apps/miniApps/kiosk/KioskVisualization';
import {KioskScene} from '@cdo/apps/miniApps/kiosk/types';

import '@testing-library/jest-dom';

// MUI's button ripple schedules state updates that don't line up with act()
// boundaries and warn after the test. It is cosmetic, so disable it.
const noRippleTheme = createTheme({
  components: {MuiButtonBase: {defaultProps: {disableRipple: true}}},
});

const sliderScene = (value: number): KioskScene => ({
  elements: [
    {
      type: KioskElementType.SLIDER,
      id: 'volume',
      text: 'Volume',
      x: 5,
      y: 30,
      min: 0,
      max: 11,
      value,
    },
  ],
});

const renderScene = (scene: KioskScene, onElementEvent: jest.Mock) =>
  render(
    <ThemeProvider theme={noRippleTheme}>
      <KioskVisualization scene={scene} onElementEvent={onElementEvent} />
    </ThemeProvider>
  );

describe('KioskVisualization', () => {
  let onElementEvent: jest.Mock;

  beforeEach(() => {
    onElementEvent = jest.fn();
  });

  it('renders a slider over its range', () => {
    renderScene(sliderScene(3), onElementEvent);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('3');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '11');
    expect(screen.getByText('Volume')).toBeInTheDocument();
  });

  it('does not send while the handle is being dragged', () => {
    renderScene(sliderScene(3), onElementEvent);
    const slider = screen.getByRole('slider');

    fireEvent.change(slider, {target: {value: '5'}});
    fireEvent.change(slider, {target: {value: '8'}});

    // The program handles one event at a time and is blocked until it does, so
    // every step of a drag must not become an event.
    expect(onElementEvent).not.toHaveBeenCalled();
    expect(slider).toHaveValue('8');
  });

  it('sends where the handle came to rest', () => {
    renderScene(sliderScene(3), onElementEvent);
    const slider = screen.getByRole('slider');

    fireEvent.change(slider, {target: {value: '5'}});
    fireEvent.change(slider, {target: {value: '8'}});
    fireEvent.pointerUp(slider);

    expect(onElementEvent).toHaveBeenCalledTimes(1);
    expect(onElementEvent).toHaveBeenCalledWith({id: 'volume', value: 8});
  });

  it('sends a value the arrow keys left behind', () => {
    renderScene(sliderScene(3), onElementEvent);
    const slider = screen.getByRole('slider');

    fireEvent.change(slider, {target: {value: '4'}});
    fireEvent.keyUp(slider, {key: 'ArrowRight'});

    expect(onElementEvent).toHaveBeenCalledWith({id: 'volume', value: 4});
  });

  it('sends nothing when the handle did not move', () => {
    renderScene(sliderScene(3), onElementEvent);
    const slider = screen.getByRole('slider');

    fireEvent.pointerUp(slider);
    fireEvent.blur(slider);

    expect(onElementEvent).not.toHaveBeenCalled();
  });

  it('follows a handle the program moved itself', () => {
    const {rerender} = renderScene(sliderScene(3), onElementEvent);

    rerender(
      <ThemeProvider theme={noRippleTheme}>
        <KioskVisualization
          scene={sliderScene(9)}
          onElementEvent={onElementEvent}
        />
      </ThemeProvider>
    );

    expect(screen.getByRole('slider')).toHaveValue('9');
  });

  it('sends a press with no value', () => {
    renderScene(
      {
        elements: [
          {
            type: KioskElementType.BUTTON,
            id: 'go',
            text: 'Press me',
            x: 0,
            y: 0,
          },
        ],
      },
      onElementEvent
    );

    fireEvent.click(screen.getByRole('button', {name: 'Press me'}));

    expect(onElementEvent).toHaveBeenCalledWith({id: 'go'});
  });
});
