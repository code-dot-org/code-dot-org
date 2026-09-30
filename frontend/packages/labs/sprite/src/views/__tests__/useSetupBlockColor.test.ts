import {act, renderHook} from '@testing-library/react';
import * as BlocklyCore from 'blockly/core';
import {describe, expect, it} from 'vitest';

import {useSetupBlockColor} from '../useSetupBlockColor';

// A workspace whose theme can change, notifying its listeners as Blockly does.
function fakeWorkspace(color: string) {
  let theme = {blockStyles: {setup_blocks: {colourPrimary: color}}};
  const listeners = new Set<(event: {type: string}) => void>();
  return {
    getTheme: () => theme,
    addChangeListener: (listener: (event: {type: string}) => void) =>
      listeners.add(listener),
    removeChangeListener: (listener: (event: {type: string}) => void) =>
      listeners.delete(listener),
    setThemeColor(next: string) {
      theme = {blockStyles: {setup_blocks: {colourPrimary: next}}};
      listeners.forEach(listener =>
        listener({type: BlocklyCore.Events.THEME_CHANGE}),
      );
    },
    listenerCount: () => listeners.size,
  };
}

describe('useSetupBlockColor', () => {
  it('is null without a workspace', () => {
    const {result} = renderHook(() => useSetupBlockColor(null));
    expect(result.current).toBeNull();
  });

  it("follows the workspace's theme, and stops listening on unmount", () => {
    const workspace = fakeWorkspace('#ff0000');
    const {result, unmount} = renderHook(() =>
      useSetupBlockColor(workspace as unknown as BlocklyCore.WorkspaceSvg),
    );
    expect(result.current).toBe('#ff0000');
    act(() => workspace.setThemeColor('#00ff00'));
    expect(result.current).toBe('#00ff00');
    unmount();
    expect(workspace.listenerCount()).toBe(0);
  });
});
