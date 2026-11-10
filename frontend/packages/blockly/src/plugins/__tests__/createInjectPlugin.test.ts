import * as Blockly from 'blockly/core';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import DefaultTheme from '../../themes/default';
import {createInjectPlugin} from '../index';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const fakeWorkspace = () => {
  const listeners: ((event: Blockly.Events.Abstract) => void)[] = [];
  return {
    listeners,
    workspace: {
      addChangeListener: (fn: (event: Blockly.Events.Abstract) => void) =>
        listeners.push(fn),
      removeChangeListener: (fn: (event: Blockly.Events.Abstract) => void) =>
        listeners.splice(listeners.indexOf(fn), 1),
    } as unknown as Blockly.WorkspaceSvg,
  };
};

describe('definitions.md: createInjectPlugin', () => {
  it('DEF-26: threads the onInit state through every callback, onReady after a zero timeout', () => {
    const {listeners, workspace} = fakeWorkspace();
    const calls: string[] = [];
    const {plugin} = createInjectPlugin({
      onInit: () => {
        calls.push('init');
        return 'state';
      },
      onReady: (_workspace, _theme, state) => calls.push(`ready ${state}`),
      onChange: (_event, state) => calls.push(`change ${state}`),
      onDispose: (_workspace, _theme, state) => calls.push(`dispose ${state}`),
    });

    const instance = new plugin(workspace, DefaultTheme) as {dispose(): void};
    expect(calls).toEqual(['init']);
    listeners.forEach(fn => fn({} as Blockly.Events.Abstract));
    vi.runAllTimers();
    instance.dispose();

    expect(calls).toEqual([
      'init',
      'change state',
      'ready state',
      'dispose state',
    ]);
    expect(listeners).toHaveLength(0);
  });

  it('DEF-26: disposal cancels a pending onReady, and only the first disposal counts', () => {
    const {workspace} = fakeWorkspace();
    const onReady = vi.fn();
    const onDispose = vi.fn();
    const {plugin} = createInjectPlugin({onInit: () => 0, onReady, onDispose});

    const instance = new plugin(workspace, DefaultTheme) as {dispose(): void};
    instance.dispose();
    instance.dispose();
    vi.runAllTimers();

    expect(onReady).not.toHaveBeenCalled();
    expect(onDispose).toHaveBeenCalledTimes(1);
  });
});
