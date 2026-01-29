import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {AppLabTooltipOverlay} from '@cdo/apps/applab/AppLabTooltipOverlay';
import * as gridUtils from '@cdo/apps/applab/gridUtils';

describe('AppLabTooltipOverlay', () => {
  const TEST_APP_WIDTH = 200;
  const TEST_APP_HEIGHT = 150;
  const TEST_MOUSE_X = 45.2;
  const TEST_MOUSE_Y = 89.7;
  const TEST_PROPS = {
    width: TEST_APP_WIDTH,
    height: TEST_APP_HEIGHT,
    mouseX: TEST_MOUSE_X,
    mouseY: TEST_MOUSE_Y,
    isInDesignMode: false,
  };

  const CONTROL_ID = 'fake-id';
  const SCREEN_ID = 'screen-id';

  let stubDraggedElementDropPoint;
  let crosshairContainer;

  const buildCrosshairDom = () => {
    crosshairContainer = document.createElement('div');
    crosshairContainer.className = 'withCrosshair';

    const fakeScreen = document.createElement('div');
    fakeScreen.className = 'screen';
    fakeScreen.id = SCREEN_ID;
    crosshairContainer.appendChild(fakeScreen);

    const fakeElement = document.createElement('div');
    fakeElement.id = CONTROL_ID;
    fakeScreen.appendChild(fakeElement);

    document.body.appendChild(crosshairContainer);
    return {fakeElement, fakeScreen};
  };

  beforeEach(() => {
    stubDraggedElementDropPoint = jest
      .spyOn(gridUtils, 'draggedElementDropPoint')
      .mockClear()
      .mockImplementation();
    stubDraggedElementDropPoint.mockReturnValue(null);
  });

  afterEach(() => {
    stubDraggedElementDropPoint.mockRestore();
    if (crosshairContainer) {
      crosshairContainer.remove();
      crosshairContainer = null;
    }
  });

  it('shows coordinates for the current mouse position', () => {
    render(<AppLabTooltipOverlay {...TEST_PROPS} />);

    expect(
      screen.getByText(
        `x: ${Math.round(TEST_MOUSE_X)}, y: ${Math.round(TEST_MOUSE_Y)}`
      )
    ).toBeInTheDocument();
  });

  it('shows coordinates for the drag drop point when dragging', () => {
    const DROP_POINT_X = 42;
    const DROP_POINT_Y = 43;
    stubDraggedElementDropPoint.mockReturnValue({
      left: DROP_POINT_X,
      top: DROP_POINT_Y,
    });

    render(<AppLabTooltipOverlay {...TEST_PROPS} />);

    expect(
      screen.getByText(
        `x: ${Math.round(DROP_POINT_X)}, y: ${Math.round(DROP_POINT_Y)}`
      )
    ).toBeInTheDocument();
  });

  it('shows the element id when hovering an applab control', () => {
    const {fakeElement} = buildCrosshairDom();

    render(<AppLabTooltipOverlay {...TEST_PROPS} />);

    fireEvent.mouseMove(fakeElement);

    expect(screen.getByText(`id: ${CONTROL_ID}`)).toBeInTheDocument();
  });

  it('shows the screen id when hovering an applab screen', () => {
    const {fakeScreen} = buildCrosshairDom();

    render(<AppLabTooltipOverlay {...TEST_PROPS} />);

    fireEvent.mouseMove(fakeScreen);

    expect(screen.getByText(`id: ${SCREEN_ID}`)).toBeInTheDocument();
  });
});
