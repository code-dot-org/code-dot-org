import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import type {ExistingLevelExperience} from '@code-dot-org/authoring';

import {authoringApi} from '@/modules/authoring';

import type {UseLevelDraftResult} from '../../levelDraft';
import {VideoFields, WorkspaceFields} from '../PropertiesPanel';

// PropertiesPanel.tsx imports authoringApi from the module index (not
// '../api' directly) — mock it there, same target the component resolves.
vi.mock('@/modules/authoring', () => ({
  authoringApi: {applyChange: vi.fn()},
}));

const applyChange = vi.mocked(authoringApi.applyChange);

function makeLevelDraft(
  overrides: Partial<UseLevelDraftResult> = {},
): UseLevelDraftResult {
  return {
    dirty: false,
    busy: false,
    error: null,
    checking: false,
    checkResult: null,
    dismissCheckResult: vi.fn(),
    currentStartDirection: '1',
    setStartDirection: vi.fn(),
    paintTools: [],
    goalFields: [],
    setNectarGoal: vi.fn(),
    setHoneyGoal: vi.fn(),
    setMinCollected: vi.fn(),
    setFlowerType: vi.fn(),
    tray: [],
    availableBlocks: [],
    addChip: vi.fn(),
    removeChip: vi.fn(),
    moveChip: vi.fn(),
    effectiveSolutionXml: undefined,
    effectiveIdeal: undefined,
    effectiveVerified: false,
    setIdeal: vi.fn(),
    switchWorkspaceMode: vi.fn(),
    clearWorkspace: vi.fn(),
    blockPalette: [
      {id: 'moveForward', label: 'Move forward', xml: '<block type="maze_moveForward"/>'},
    ],
    addBlockToWorkspace: vi.fn(),
    acceptSolutionOffer: vi.fn(),
    submit: vi.fn(),
    runCheck: vi.fn(),
    discard: vi.fn(),
    ...overrides,
  };
}

// Author Mode acceptance run observed "Show all blocks" come up CHECKED on
// a level the author never touched — the exact footgun useState(false) is
// supposed to guard against. PropertiesPanel now keys WorkspaceFields on
// the experience id (see the call site's comment) precisely so a fresh
// experience always gets a fresh, unchecked toggle rather than inheriting
// whatever the previously-viewed level's author left it at.
describe('WorkspaceFields "Show all blocks" toggle', () => {
  it('starts unchecked, and stays unchecked for a different experience key', () => {
    const props = {
      levelDraft: makeLevelDraft(),
      workspaceMode: 'mySolution' as const,
      onDismissSolutionOffer: vi.fn(),
      onClose: vi.fn(),
      onDirtyChange: vi.fn(),
    };

    const {rerender} = render(
      <WorkspaceFields key="level-a" {...props} />,
    );
    const checkbox = screen.getByLabelText(/show all blocks/i);
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Same key, same experience — an ordinary re-render (e.g. a levelDraft
    // field updating) must NOT reset the author's own in-progress toggle.
    rerender(<WorkspaceFields key="level-a" {...props} />);
    expect(screen.getByLabelText(/show all blocks/i)).toBeChecked();

    // A different experience — mirrors PropertiesPanel switching
    // `key={experience.id}` — must remount with a fresh, unchecked toggle.
    rerender(<WorkspaceFields key="level-b" {...props} />);
    expect(screen.getByLabelText(/show all blocks/i)).not.toBeChecked();
  });
});

function videoExperience(
  overrides: Partial<ExistingLevelExperience> = {},
): ExistingLevelExperience {
  return {
    id: 'lb:some_video',
    origin: 'levelbuilder',
    kind: 'existingLevel',
    levelKey: 'some_video',
    levelType: 'Video',
    runtime: 'generic',
    levelNumericId: 9000007,
    title: 'Elementary Machine Learning',
    data: {type: 'video', videoKey: 'elementary_machine_learning'},
    ...overrides,
  };
}

describe('VideoFields', () => {
  it('seeds every field from the current data, disabled Save while clean', () => {
    render(
      <VideoFields
        experience={videoExperience()}
        data={{type: 'video', videoKey: 'elementary_machine_learning'}}
        onClose={vi.fn()}
        onDirtyChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(/youtube video id/i)).toHaveValue('');
    expect(screen.getByLabelText(/video key/i)).toHaveValue(
      'elementary_machine_learning',
    );
    expect(screen.getByRole('button', {name: /save/i})).toBeDisabled();
  });

  it('saves the whole variant through updateGenericLevelData, fixing the placeholder code', async () => {
    applyChange.mockReset().mockResolvedValue(undefined as never);
    const onClose = vi.fn();
    const onDirtyChange = vi.fn();
    render(
      <VideoFields
        experience={videoExperience()}
        data={{type: 'video', videoKey: 'elementary_machine_learning'}}
        onClose={onClose}
        onDirtyChange={onDirtyChange}
      />,
    );

    fireEvent.change(screen.getByLabelText(/youtube video id/i), {
      target: {value: 'dQw4w9WgXcQ'},
    });
    expect(onDirtyChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByRole('button', {name: /save/i}));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(applyChange).toHaveBeenCalledWith({
      op: 'updateGenericLevelData',
      experienceId: 'lb:some_video',
      data: {type: 'video', videoKey: 'elementary_machine_learning', youtubeCode: 'dQw4w9WgXcQ'},
    });
    // Title never changed — updateContent must not fire alongside it.
    expect(applyChange).not.toHaveBeenCalledWith(
      expect.objectContaining({op: 'updateContent'}),
    );
  });

  it('saves title and data as two separate ops when both changed', async () => {
    applyChange.mockReset().mockResolvedValue(undefined as never);
    render(
      <VideoFields
        experience={videoExperience()}
        data={{type: 'video', videoKey: 'elementary_machine_learning'}}
        onClose={vi.fn()}
        onDirtyChange={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^title$/i), {
      target: {value: 'Renamed'},
    });
    fireEvent.change(screen.getByLabelText(/youtube video id/i), {
      target: {value: 'dQw4w9WgXcQ'},
    });
    fireEvent.click(screen.getByRole('button', {name: /save/i}));

    await waitFor(() => expect(applyChange).toHaveBeenCalledTimes(2));
    expect(applyChange).toHaveBeenCalledWith({
      op: 'updateContent',
      experienceId: 'lb:some_video',
      patch: {title: 'Renamed'},
    });
    expect(applyChange).toHaveBeenCalledWith({
      op: 'updateGenericLevelData',
      experienceId: 'lb:some_video',
      data: {type: 'video', videoKey: 'elementary_machine_learning', youtubeCode: 'dQw4w9WgXcQ'},
    });
  });
});
