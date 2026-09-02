// The shelves answer whoever asks, and write what was chosen.
//
// What this covers is the WIRING, which nothing did before it: the dialogs have
// tests of their own and the `importStock…` writers have tests of their own,
// and between them sat a seam that a Blockly field asked on and one editor
// answered. Moving that answer up a level (so the file menus can ask too) is
// exactly the kind of change where every part still works and the whole stops.

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

const SOURCE: MultiFileSource = {files: {}, folders: {}, openFiles: []};
const updateSources = vi.fn();

vi.mock('@code-dot-org/lab/contexts', () => ({
  useSources: () => ({
    currentSources: {source: SOURCE},
    updateSources,
    sourcesEpoch: 0,
  }),
}));

const {LibraryImports} = await import('../LibraryImports');
const {requestRuleImport} = await import('../../blockly/ruleImport');

describe('the import shelves', () => {
  it('open on request and hand back what was chosen', async () => {
    render(<LibraryImports />);
    // Nothing on screen until something asks: five dialogs mounted eagerly
    // would be five modals fighting over the page.
    expect(screen.queryByRole('dialog')).toBeNull();

    const asked = requestRuleImport();
    // A row SELECTS and `Import` commits, which is the dialog's own bargain:
    // a rule brings what it needs with it, so the row you land on first is
    // rarely the one you meant once you have read what comes along.
    fireEvent.click(
      (await screen.findAllByRole('button', {name: /Has Gravity/}))[0],
    );
    fireEvent.click(screen.getByRole('button', {name: 'Import'}));

    // The NAME, which is what a rule field holds — never the file's path.
    await expect(asked).resolves.toBe('Gravity');
    // …and the file is in the project before the value is handed over: the
    // dropdown rebuilds from the registry, and a value with no matching option
    // is dropped by Blockly.
    expect(updateSources).toHaveBeenCalled();
  });

  it('hands back nothing when the shelf is closed', async () => {
    render(<LibraryImports />);

    const asked = requestRuleImport();
    fireEvent.click(await screen.findByRole('button', {name: 'Cancel'}));

    await expect(asked).resolves.toBeUndefined();
  });
});
