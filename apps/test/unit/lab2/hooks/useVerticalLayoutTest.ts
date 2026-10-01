import {renderHook} from '@testing-library/react-hooks';
import React from 'react';

import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import {RESIZE_BAR_SIZE_PX} from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import {LabContentWidthProvider} from '@cdo/apps/lab2/views/LabContentWidth';

const VIEWPORT_WIDTH = 1400;

const TWO_PANEL = {
  leftPanel: {name: 'left', minWidth: 200, initialWidth: 400},
  rightPanel: {name: 'right', minWidth: 200, initialWidth: 1000},
  appName: 'testlab',
};

const measuredAt = (width: number) => ({
  wrapper: ({children}: {children: React.ReactNode}) =>
    React.createElement(LabContentWidthProvider, {value: width}, children),
});

const panelsTotal = (result: {
  current: {leftPanelWidth?: number; rightPanelWidth?: number};
}) =>
  result.current.leftPanelWidth! +
  result.current.rightPanelWidth! +
  RESIZE_BAR_SIZE_PX;

describe('useVerticalLayout', () => {
  beforeEach(() => {
    window.innerWidth = VIEWPORT_WIDTH;
  });

  it('fills the box Lab2Wrapper measures for it, ignoring the window', () => {
    // Lab2Wrapper lays the TA drawer out beside the lab, so the lab's box is
    // already narrower than the window whenever the drawer is open. The lab
    // never learns the drawer exists; it just gets a smaller box.
    const {result} = renderHook(
      () => useVerticalLayout(TWO_PANEL),
      measuredAt(900)
    );

    expect(panelsTotal(result)).toBe(900);
  });

  it('falls back to the window before the box has been measured', () => {
    // No provider stands in for the first render of a page, and for a lab
    // rendered outside a Lab2Wrapper altogether.
    const {result} = renderHook(() => useVerticalLayout(TWO_PANEL));

    expect(panelsTotal(result)).toBe(VIEWPORT_WIDTH);
  });

  it('re-lays out when the measured box changes', () => {
    const {result, rerender} = renderHook(() => useVerticalLayout(TWO_PANEL), {
      // children is supplied by the renderer, width by initialProps/rerender.
      wrapper: ({
        children,
        width,
      }: {
        children?: React.ReactNode;
        width: number;
      }) =>
        React.createElement(LabContentWidthProvider, {value: width}, children),
      initialProps: {width: 900},
    });
    expect(panelsTotal(result)).toBe(900);

    rerender({width: 700});

    expect(panelsTotal(result)).toBe(700);
  });
});
