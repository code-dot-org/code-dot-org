import {act, renderHook} from '@testing-library/react-hooks';
import React from 'react';

import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import {RESIZE_BAR_SIZE_PX} from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import {LabContentWidthProvider} from '@cdo/apps/lab2/views/LabContentWidth';
import {setTaDrawerInset} from '@cdo/apps/util/taDrawerInset';

const VIEWPORT_WIDTH = 1400;
const DRAWER_WIDTH = 400;

const TWO_PANEL = {
  leftPanel: {name: 'left', minWidth: 200, initialWidth: 400},
  rightPanel: {name: 'right', minWidth: 200, initialWidth: 1000},
  appName: 'testlab',
};

describe('useVerticalLayout', () => {
  beforeEach(() => {
    window.innerWidth = VIEWPORT_WIDTH;
  });

  // The inset is global, and the hook is still mounted when this runs.
  afterEach(() => act(() => setTaDrawerInset(0)));

  it('fills the viewport when no drawer is open', () => {
    const {result} = renderHook(() => useVerticalLayout(TWO_PANEL));

    expect(
      result.current.leftPanelWidth! +
        result.current.rightPanelWidth! +
        RESIZE_BAR_SIZE_PX
    ).toBe(VIEWPORT_WIDTH);
  });

  it('fills the box Lab2Wrapper measures for it, ignoring the window', () => {
    // Lab2Wrapper lays the drawer out beside the lab, so the lab's box is
    // already narrower than the window and no inset is published.
    const MEASURED = 900;
    const wrapper = ({children}: {children: React.ReactNode}) =>
      React.createElement(
        LabContentWidthProvider,
        {value: MEASURED},
        children
      );

    const {result} = renderHook(() => useVerticalLayout(TWO_PANEL), {wrapper});

    expect(
      result.current.leftPanelWidth! +
        result.current.rightPanelWidth! +
        RESIZE_BAR_SIZE_PX
    ).toBe(MEASURED);
  });

  it('gives up the width the drawer takes rather than overflowing it', () => {
    const {result} = renderHook(() => useVerticalLayout(TWO_PANEL));

    act(() => setTaDrawerInset(DRAWER_WIDTH));

    expect(
      result.current.leftPanelWidth! +
        result.current.rightPanelWidth! +
        RESIZE_BAR_SIZE_PX
    ).toBe(VIEWPORT_WIDTH - DRAWER_WIDTH);
  });
});
