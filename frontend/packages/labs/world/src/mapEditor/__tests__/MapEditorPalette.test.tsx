// What the palette draws for a kind: the symbol it elected, before its picture.
//
// A picker's question is WHICH KIND, and an interface actor's picture is its
// content — a Label's thumbnail is whatever its default words are, on whatever
// ground the cell has. `show as ⟨text⟩` exists so that a picker can say "a
// Label" without drawing one (specs/UI_ACTORS.md), and every other picker
// already asked it first; this one drew the thumbnail regardless.

import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

/** The heavy half: a canvas, replaced by nothing. */
vi.mock('../MapStage', () => ({
  MapStage: () => <div data-testid="stage" />,
}));

/** A `define actor` root, with a `show as` row when an icon is given. */
const actorFile = (name: string, icon?: string) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          fields: {NAME: name},
          ...(icon
            ? {next: {block: {type: 'world_show_as', fields: {ICON: icon}}}}
            : {}),
        },
      ],
    },
  });

const SOURCE: MultiFileSource = {
  files: {
    label: {
      id: 'label',
      name: 'label.actor',
      language: 'actor',
      contents: actorFile('Label', 'text'),
      folderId: 'actors',
    },
    coin: {
      id: 'coin',
      name: 'coin.actor',
      language: 'actor',
      contents: actorFile('Coin'),
      folderId: 'actors',
    },
  },
  folders: {actors: {id: 'actors', name: 'actors', parentId: '0'}},
  openFiles: [],
};

vi.mock('@code-dot-org/lab/contexts', () => ({
  useSources: () => ({
    currentSources: {source: SOURCE},
    updateSources: vi.fn(),
    sourcesEpoch: 0,
  }),
}));

// No sandbox: nothing ever answers with a thumbnail, which is also the state
// a map opened first is in.
vi.mock('../../runtime/WorldRuntimeContext', () => ({
  useWorldRuntime: () => ({getActorInfo: vi.fn(), hasCompiled: false}),
}));

const {MapEditor} = await import('../MapEditor');

const EMPTY_MAP = JSON.stringify({
  type: 'map',
  size: {width: 10, height: 10},
  tile: {width: 32, height: 32},
  actors: [],
});

describe('the map editor’s palette', () => {
  it('wears the symbol a kind elected, with no thumbnail needed', () => {
    render(
      <MapEditor
        fileId="1"
        initialContents={EMPTY_MAP}
        language="map"
        isReadOnly={false}
        onChange={vi.fn()}
      />,
    );
    const label = screen.getByRole('button', {name: /label/i});
    const image = label.querySelector('img');
    expect(image?.getAttribute('src')).toMatch(/^data:image\/svg\+xml/);
  });

  it('shows nothing for a kind with no symbol until its picture arrives', () => {
    render(
      <MapEditor
        fileId="1"
        initialContents={EMPTY_MAP}
        language="map"
        isReadOnly={false}
        onChange={vi.fn()}
      />,
    );
    const coin = screen.getByRole('button', {name: /coin/i});
    expect(coin.querySelector('img')).toBeNull();
  });
});
