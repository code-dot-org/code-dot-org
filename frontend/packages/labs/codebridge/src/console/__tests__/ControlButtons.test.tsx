import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, expect, it, vi} from 'vitest';

import {RootStateProvider} from '@code-dot-org/core/redux';
import {labSystemActions} from '@code-dot-org/lab/redux';

import {CodebridgeRuntimeProvider} from '../../contexts';
import store from '../../redux/store';
import ControlButtons from '../ControlButtons';

afterEach(() => {
  act(() => {
    store.dispatch(labSystemActions.setIsRunning(false));
    store.dispatch(labSystemActions.setLoadedCodeEnvironment(false));
  });
});

const renderButtons = (runtime: {onRun?: () => void; onStop?: () => void}) =>
  render(
    <RootStateProvider>
      <CodebridgeRuntimeProvider runtime={runtime}>
        <ControlButtons />
      </CodebridgeRuntimeProvider>
    </RootStateProvider>,
  );

it('shows Run and invokes onRun once the environment has loaded', () => {
  const onRun = vi.fn();
  renderButtons({onRun});

  act(() => {
    store.dispatch(labSystemActions.setLoadedCodeEnvironment(true));
  });

  fireEvent.click(screen.getByRole('button', {name: /run/i}));
  expect(onRun).toHaveBeenCalled();
});

it('disables Run while the environment is still loading', () => {
  const onRun = vi.fn();
  renderButtons({onRun});

  const runButton = screen.getByRole('button', {name: /run/i});
  expect((runButton as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(runButton);
  expect(onRun).not.toHaveBeenCalled();
});

it('shows Stop and invokes onStop while running', () => {
  const onStop = vi.fn();
  renderButtons({onStop});

  act(() => {
    store.dispatch(labSystemActions.setIsRunning(true));
  });

  expect(screen.queryByRole('button', {name: /run/i})).toBe(null);
  fireEvent.click(screen.getByRole('button', {name: /stop/i}));
  expect(onStop).toHaveBeenCalled();
});
