import {fireEvent, render, screen} from '@testing-library/react';
import {afterEach, expect, it, vi} from 'vitest';

import type {
  Channel,
  LevelProperties,
  MultiFileSource,
} from '@code-dot-org/core/api';
import {LabRegistry, RootStateProvider} from '@code-dot-org/lab';
import {SourcesProvider} from '@code-dot-org/lab/contexts';
import {labActions} from '@code-dot-org/lab/redux';

import CodebridgeTextEditor from '../components/CodebridgeTextEditor';
import {samplePythonSource} from '../fixtures';
import store from '../redux/store';
import {getEmptyProject} from '../utils/multiFileSource';

// The vertical slice's single load-bearing claim: a Codebridge source edit
// round-trips through the base SourcesContext and is persisted via
// `LabRegistry.projectManager`. This exercises the seam directly — no Lab host,
// no network — by mounting SourcesProvider (keyed to a MultiFileSource) around
// the bare textarea editor with a mock project manager installed.

const levelProperties = {} as LevelProperties;

afterEach(() => {
  LabRegistry.projectManager = undefined;
  store.dispatch(labActions.setChannel(undefined));
});

const renderEditor = (save: ReturnType<typeof vi.fn>) => {
  // `LabRegistry.projectManager` is `ProjectManager | undefined`; the type is not
  // exported, so cast the mock through `typeof` rather than naming it.
  LabRegistry.projectManager = {
    save,
  } as unknown as typeof LabRegistry.projectManager;

  // SourcesContext only saves when the workspace is not read-only, which
  // requires the current user to own the channel. Seed an owned channel.
  store.dispatch(labActions.setChannel({isOwner: true} as Channel));

  return render(
    <RootStateProvider>
      <SourcesProvider<LevelProperties, MultiFileSource>
        levelProperties={levelProperties}
        initialSources={{source: samplePythonSource}}
        defaultSources={{source: getEmptyProject()}}
      >
        <CodebridgeTextEditor />
      </SourcesProvider>
    </RootStateProvider>,
  );
};

it('shows the active file and saves edits back through the project manager', () => {
  const save = vi.fn();
  renderEditor(save);

  const textarea = screen.getByLabelText('Editing main.py') as HTMLTextAreaElement;
  // Reads the active file from the multi-file source.
  expect(textarea.value).toBe(samplePythonSource.files['1'].contents);

  fireEvent.change(textarea, {target: {value: 'print("edited")\n'}});

  // The edit re-renders from the updated SourcesContext state (read/write round-trip)...
  expect(textarea.value).toBe('print("edited")\n');

  // ...and is persisted via LabRegistry.projectManager.save with the edited source.
  expect(save).toHaveBeenCalled();
  const savedSource = save.mock.calls.at(-1)?.[0].source as MultiFileSource;
  expect(savedSource.files['1'].contents).toBe('print("edited")\n');
  // Untouched structure survives the edit.
  expect(savedSource.files['1'].name).toBe('main.py');
});
