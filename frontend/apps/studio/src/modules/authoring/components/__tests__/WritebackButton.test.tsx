import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {PropsWithChildren} from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {WritebackApplyOutcome, WritebackPlan} from '../../api';
import {authoringApi} from '../../api';
import {WritebackButton} from '../AuthoringTopBar';

vi.mock('../../api', () => ({
  authoringApi: {
    fetchWritebackPlan: vi.fn(),
    applyWriteback: vi.fn(),
  },
}));

const fetchWritebackPlan = vi.mocked(authoringApi.fetchWritebackPlan);
const applyWriteback = vi.mocked(authoringApi.applyWriteback);

function wrapper() {
  const queryClient = new QueryClient();
  return function Wrapper({children}: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

const EMPTY_PLAN: WritebackPlan = {planHash: 'empty', edits: [], skipped: []};

const ONE_EDIT_PLAN: WritebackPlan = {
  planHash: 'hash-1',
  edits: [
    {
      path: 'dashboard/config/levels/custom/maze/some_level.level',
      levelKey: 'some_level',
      unifiedDiff:
        '--- some_level.level\n+++ some_level.level\n@@ -1,1 +1,1 @@\n-    "short_instructions": "Old.",\n+    "short_instructions": "New.",',
      beforeHash: 'before-1',
      afterHash: 'after-1',
    },
  ],
  skipped: [{experienceId: 'lb:other_level', field: 'title', reason: 'title has no .level file field'}],
};

describe('WritebackButton', () => {
  beforeEach(() => {
    fetchWritebackPlan.mockReset();
    applyWriteback.mockReset();
  });

  it('is disabled with a "nothing to write" tooltip when the plan has no edits', async () => {
    fetchWritebackPlan.mockResolvedValue(EMPTY_PLAN);
    render(<WritebackButton />, {wrapper: wrapper()});

    const button = await screen.findByRole('button', {name: /write to dashboard\/config/i});
    await waitFor(() => expect(button).toBeDisabled());

    // Tooltip's ref sits on the wrapping <span>, not the disabled <button>
    // itself — a disabled element has pointer-events: none and never fires
    // the hover MUI's Tooltip listens for, same as Undo/Redo/Publish above.
    await userEvent.hover(button.parentElement as HTMLElement);
    expect(await screen.findByText('No file-backed changes to write')).toBeInTheDocument();
  });

  it('shows the diff and skipped list, then writes on confirm', async () => {
    fetchWritebackPlan.mockResolvedValue(ONE_EDIT_PLAN);
    const outcome: WritebackApplyOutcome = {
      ok: true,
      result: {
        planHash: 'hash-1',
        applied: [{path: ONE_EDIT_PLAN.edits[0].path, afterHash: 'after-1'}],
        skipped: [],
      },
    };
    applyWriteback.mockResolvedValue(outcome);

    render(<WritebackButton />, {wrapper: wrapper()});
    const button = await screen.findByRole('button', {name: /write to dashboard\/config/i});
    await waitFor(() => expect(button).toBeEnabled());
    await userEvent.click(button);

    const dialog = await screen.findByText(/write 1 file to dashboard\/config\?/i);
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(ONE_EDIT_PLAN.edits[0].path)).toBeInTheDocument();
    expect(screen.getByText(/short_instructions.*Old\./)).toBeInTheDocument();
    expect(screen.getByText(/title has no \.level file field/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', {name: /^write 1 file$/i}));

    expect(applyWriteback).toHaveBeenCalledWith('hash-1');
    expect(await screen.findByText(/wrote 1 file:/i)).toBeInTheDocument();
    expect(screen.getByText(ONE_EDIT_PLAN.edits[0].path)).toBeInTheDocument();
    expect(screen.getByText(/nothing was committed/i)).toBeInTheDocument();
  });

  it('on a stale plan, shows the refreshed diff instead of silently retrying', async () => {
    fetchWritebackPlan.mockResolvedValue(ONE_EDIT_PLAN);
    const freshPlan: WritebackPlan = {
      ...ONE_EDIT_PLAN,
      planHash: 'hash-2',
      edits: [
        {
          ...ONE_EDIT_PLAN.edits[0],
          unifiedDiff: 'a fresh diff after a further edit',
        },
      ],
    };
    applyWriteback.mockResolvedValue({ok: false, reason: 'plan-changed', plan: freshPlan});

    render(<WritebackButton />, {wrapper: wrapper()});
    const button = await screen.findByRole('button', {name: /write to dashboard\/config/i});
    await waitFor(() => expect(button).toBeEnabled());
    await userEvent.click(button);
    await userEvent.click(await screen.findByRole('button', {name: /^write 1 file$/i}));

    expect(await screen.findByText(/plan changed since you opened this dialog/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', {name: /review again/i}));
    expect(await screen.findByText('a fresh diff after a further edit')).toBeInTheDocument();
  });
});
