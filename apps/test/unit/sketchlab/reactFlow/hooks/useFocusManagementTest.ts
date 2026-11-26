import {act, renderHook} from '@testing-library/react-hooks';
import type React from 'react';

import {useFocusManagement} from '@cdo/apps/sketchlab/reactFlow/hooks/useFocusManagement';

jest.mock('@xyflow/react', () => ({
  useReactFlow: () => ({fitView: jest.fn(), getZoom: () => 1}),
}));

const edgeEntry = {type: 'edge' as const, id: 'e1'};

function setUp() {
  const edgeElement = document.createElement('div');
  edgeElement.className = 'react-flow__edge';
  edgeElement.setAttribute('data-id', edgeEntry.id);
  document.body.appendChild(edgeElement);

  const hook = renderHook(() =>
    useFocusManagement([edgeEntry], [], false, jest.fn(), jest.fn())
  );
  const focusEdge = () =>
    act(() => {
      hook.result.current.handleFocusCapture({
        target: edgeElement,
      } as unknown as React.FocusEvent);
    });
  return {hook, edgeElement, focusEdge};
}

// Mirrors :focus-visible, which the node rings use: a keyboard focus shows
// the focus colour, a pointer focus does not.
describe('useFocusManagement focusVisible', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('is true when the keyboard moves focus', () => {
    const {hook, focusEdge} = setUp();
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab'}));
    focusEdge();
    expect(hook.result.current.focusVisible).toBe(true);
  });

  it('is false when a pointer moves focus', () => {
    const {hook, edgeElement, focusEdge} = setUp();
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab'}));
    focusEdge();
    edgeElement.dispatchEvent(new Event('pointerdown', {bubbles: true}));
    focusEdge();
    expect(hook.result.current.focusVisible).toBe(false);
  });
});
