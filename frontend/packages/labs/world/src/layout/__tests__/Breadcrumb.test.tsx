// Where focus goes when a page opens (specs/ACCESSIBILITY.md, "A door that
// opens a file").

import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {Breadcrumb} from '../Breadcrumb';
import type {Trail} from '../trail';
import {TrailContext} from '../TrailContext';

vi.mock('@code-dot-org/codebridge', () => ({
  useCodebridgeConfig: () => ({}),
}));
vi.mock('@code-dot-org/lab/contexts', () => ({
  useSources: () => ({
    currentSources: {
      source: {
        files: {
          '1': {id: '1', name: 'main.screen'},
          '2': {id: '2', name: 'player.actor'},
        },
      },
    },
  }),
}));

const along = (trail: Trail) => (
  <TrailContext.Provider
    value={{trail, goTo: vi.fn(), openBeside: vi.fn(), setScript: vi.fn()}}
  >
    <button type="button">Open</button>
    <Breadcrumb />
  </TrailContext.Provider>
);

describe('the breadcrumb', () => {
  it('leaves focus where it is on the first page', () => {
    render(along([{fileId: '1'}]));
    expect(document.activeElement).toBe(document.body);
  });

  it('takes focus to the page that opens, and back', () => {
    const view = render(along([{fileId: '1'}]));
    screen.getByRole('button', {name: 'Open'}).focus();
    view.rerender(along([{fileId: '1'}, {fileId: '2'}]));
    expect(screen.getByText('player.actor')).toHaveFocus();

    view.rerender(along([{fileId: '1'}]));
    expect(screen.getByText('main.screen')).toHaveFocus();
  });
});
