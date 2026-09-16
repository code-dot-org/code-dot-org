import {render, screen, act} from '@testing-library/react';
import * as BlocklyCore from 'blockly/core';
import React from 'react';

import {WORKSPACE_EVENTS} from '@cdo/apps/blockly/constants';
import {useSetupBlockColor} from '@cdo/apps/blockly/utils/useSetupBlockColor';

// A minimal main workspace: a theme with a setup color, and change
// listeners the test can fire.
const createFakeWorkspace = initialColor => {
  const listeners = [];
  let color = initialColor;
  return {
    getTheme: () => ({blockStyles: {setup_blocks: {colourPrimary: color}}}),
    addChangeListener: listener => listeners.push(listener),
    removeChangeListener: listener => {
      const index = listeners.indexOf(listener);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    },
    setSetupColor: newColor => {
      color = newColor;
      listeners.forEach(listener =>
        listener({type: BlocklyCore.Events.THEME_CHANGE})
      );
    },
    listenerCount: () => listeners.length,
  };
};

// Renders the hook result as visible text so assertions can query it the
// way a user would see it.
const Probe = () => {
  const color = useSetupBlockColor();
  return <div>{color ?? 'no color'}</div>;
};

describe('useSetupBlockColor', () => {
  afterEach(() => {
    delete window.Blockly;
  });

  it('is null without a Blockly global', () => {
    render(<Probe />);
    expect(screen.getByText('no color')).toBeInTheDocument();
  });

  it('reads the current workspace theme and tracks theme changes', () => {
    const workspace = createFakeWorkspace('#f46800');
    window.Blockly = {getMainWorkspace: () => workspace};

    render(<Probe />);
    expect(screen.getByText('#f46800')).toBeInTheDocument();

    act(() => workspace.setSetupColor('#996300'));
    expect(screen.getByText('#996300')).toBeInTheDocument();
  });

  it('attaches when the main workspace is created after mount', () => {
    let workspace;
    window.Blockly = {getMainWorkspace: () => workspace};

    render(<Probe />);
    expect(screen.getByText('no color')).toBeInTheDocument();

    workspace = createFakeWorkspace('#FF4235');
    act(() => {
      document.dispatchEvent(
        new Event(WORKSPACE_EVENTS.MAIN_BLOCK_SPACE_CREATED)
      );
    });
    expect(screen.getByText('#FF4235')).toBeInTheDocument();
  });

  it('removes its workspace listener on unmount', () => {
    const workspace = createFakeWorkspace('#f46800');
    window.Blockly = {getMainWorkspace: () => workspace};

    const {unmount} = render(<Probe />);
    expect(workspace.listenerCount()).toBe(1);

    unmount();
    expect(workspace.listenerCount()).toBe(0);
  });
});
