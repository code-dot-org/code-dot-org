import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import type {UseLevelDraftResult} from '../../levelDraft';
import {WorkspaceFields} from '../PropertiesPanel';

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
