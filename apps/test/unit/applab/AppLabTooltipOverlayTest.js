import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  const CONTROL_ID = 'button1';
  const SCREEN_ID = 'screen1';

  let stubDraggedElementDropPoint;
  let crosshairContainer;

  const buildCrosshairDom = ({
    controlId = CONTROL_ID,
    controlTagName = 'div',
    includeResizeHandle = false,
  } = {}) => {
    crosshairContainer = document.createElement('div');
    crosshairContainer.className = 'withCrosshair';

    const testScreen = document.createElement('div');
    testScreen.className = 'screen';
    testScreen.id = SCREEN_ID;
    crosshairContainer.appendChild(testScreen);

    const testDesignElement = document.createElement(controlTagName);
    testDesignElement.id = controlId;
    testScreen.appendChild(testDesignElement);

    let resizeHandle = null;
    if (includeResizeHandle) {
      resizeHandle = document.createElement('div');
      resizeHandle.className = 'ui-resizable-handle';
      testScreen.appendChild(resizeHandle);
    }

    document.body.appendChild(crosshairContainer);
    return {testDesignElement, testScreen, resizeHandle};
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

    screen.getByText(
      `x: ${Math.round(TEST_MOUSE_X)}, y: ${Math.round(TEST_MOUSE_Y)}`
    );
  });

  it('shows coordinates for the drag drop point when dragging', () => {
    const DROP_POINT_X = 42;
    const DROP_POINT_Y = 43;
    stubDraggedElementDropPoint.mockReturnValue({
      left: DROP_POINT_X,
      top: DROP_POINT_Y,
    });

    render(<AppLabTooltipOverlay {...TEST_PROPS} />);

    screen.getByText(
      `x: ${Math.round(DROP_POINT_X)}, y: ${Math.round(DROP_POINT_Y)}`
    );
  });

  it('shows the element id when hovering an applab design element', async () => {
    const {testDesignElement} = buildCrosshairDom({controlTagName: 'button'});

    render(<AppLabTooltipOverlay {...TEST_PROPS} />);

    await userEvent.hover(testDesignElement);

    screen.getByText(`id: ${CONTROL_ID}`);
  });

  it('shows the element id when hovering a resize handle', async () => {
    const {resizeHandle} = buildCrosshairDom({includeResizeHandle: true});

    render(<AppLabTooltipOverlay {...TEST_PROPS} />);

    await userEvent.hover(resizeHandle);

    screen.getByText(`id: ${CONTROL_ID}`);
  });

  it('shows the screen id when hovering an applab screen', async () => {
    const {testScreen} = buildCrosshairDom();

    render(<AppLabTooltipOverlay {...TEST_PROPS} />);

    await userEvent.hover(testScreen);

    screen.getByText(`id: ${SCREEN_ID}`);
  });

  it('shows the unprefixed id in design mode for a generic element', async () => {
    const DESIGN_PREFIX = 'design_';
    const {testDesignElement} = buildCrosshairDom({
      controlId: `${DESIGN_PREFIX}${CONTROL_ID}`,
      controlTagName: 'div',
    });

    render(<AppLabTooltipOverlay {...TEST_PROPS} isInDesignMode={true} />);

    await userEvent.hover(testDesignElement);

    screen.getByText(`id: ${CONTROL_ID}`);
  });
});
