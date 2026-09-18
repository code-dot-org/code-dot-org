// A world opened: its map first, its workspace one switch away, and one file
// between the two (`WorldEditor`, specs/MAIN_MAP_PLAN.md).

import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

/** Each view, replaced by what it was handed and one edit it can make. */
vi.mock('../MapEditor', () => ({
  MapEditor: (props: {
    initialContents: string;
    onChange: (next: string) => void;
    onOpenMapScript?: () => void;
    document: {hasMapScript: boolean};
  }) => (
    <div data-testid="map-view" data-contents={props.initialContents}>
      <button
        type="button"
        onClick={() =>
          props.onChange(
            JSON.stringify({
              ...JSON.parse(props.initialContents),
              map: {actors: [{id: 'placed'}]},
            }),
          )
        }
      >
        Place
      </button>
      <button type="button" onClick={props.onOpenMapScript}>
        World script
      </button>
    </div>
  ),
}));
vi.mock('../../blockly/BlocklyFileEditor', () => ({
  BlocklyFileEditor: (props: {
    initialContents: string;
    onChange: (next: string) => void;
  }) => (
    <div data-testid="world-view" data-contents={props.initialContents}>
      <button
        type="button"
        onClick={() =>
          props.onChange(
            JSON.stringify({
              ...JSON.parse(props.initialContents),
              blocks: {
                blocks: [{type: 'world_world', fields: {NAME: 'Edited'}}],
              },
            }),
          )
        }
      >
        Edit blocks
      </button>
    </div>
  ),
}));

const SOURCE: MultiFileSource = {files: {}, folders: {}, openFiles: []};
/** What the level says, and what the shelf holds; each test sets its own. */
let levelData: {worldView?: 'map' | 'world'} | undefined;
let shelf:
  | {holds: (unlock: {kind: string; id?: string}) => boolean}
  | undefined;
vi.mock('../../progression/progressionContext', () => ({
  useMaybeProgression: () => shelf,
}));
vi.mock('@code-dot-org/lab/contexts', () => ({
  useMaybeLevelProperties: () => (levelData ? {levelData} : undefined),
  useSources: () => ({
    currentSources: {source: SOURCE},
    updateSources: vi.fn(),
    sourcesEpoch: 0,
  }),
}));

const {WorldEditor} = await import('../WorldEditor');

const CONTENTS = JSON.stringify({
  blocks: {blocks: [{type: 'world_world', fields: {NAME: 'W'}}]},
  map: {actors: []},
});

const open = () => {
  const onChange = vi.fn();
  render(
    <WorldEditor
      fileId="1"
      initialContents={CONTENTS}
      language="world"
      isReadOnly={false}
      onChange={onChange}
    />,
  );
  return onChange;
};

const contentsOf = (testId: string) =>
  JSON.parse(screen.getByTestId(testId).getAttribute('data-contents')!);

describe('WorldEditor', () => {
  beforeEach(() => {
    levelData = undefined;
    shelf = undefined;
  });

  it('opens on the map, with the workspace one switch away', () => {
    open();
    expect(screen.getByTestId('map-view')).toBeInTheDocument();
    expect(screen.queryByTestId('world-view')).toBeNull();
    expect(screen.getByRole('tab', {name: 'Map'})).toHaveAttribute(
      'aria-selected',
      'true',
    );

    fireEvent.click(screen.getByRole('tab', {name: 'World'}));
    expect(screen.getByTestId('world-view')).toBeInTheDocument();
    expect(screen.queryByTestId('map-view')).toBeNull();
  });

  it('hands each view the file as the other last left it', () => {
    const onChange = open();

    fireEvent.click(screen.getByRole('button', {name: 'Place'}));
    expect(JSON.parse(onChange.mock.calls.at(-1)![0]).map).toEqual({
      actors: [{id: 'placed'}],
    });

    fireEvent.click(screen.getByRole('tab', {name: 'World'}));
    expect(contentsOf('world-view').map).toEqual({actors: [{id: 'placed'}]});

    fireEvent.click(screen.getByRole('button', {name: 'Edit blocks'}));
    fireEvent.click(screen.getByRole('tab', {name: 'Map'}));
    const back = contentsOf('map-view');
    expect(back.blocks.blocks[0].fields.NAME).toBe('Edited');
    expect(back.map).toEqual({actors: [{id: 'placed'}]});
  });

  it('opens the World view for the map’s own script', () => {
    open();
    fireEvent.click(screen.getByRole('button', {name: 'World script'}));
    expect(screen.getByTestId('world-view')).toBeInTheDocument();
  });

  it('opens on the workspace when the level says its work is there', () => {
    levelData = {worldView: 'world'};
    open();
    expect(screen.getByTestId('world-view')).toBeInTheDocument();
    // …with the map still one switch away.
    fireEvent.click(screen.getByRole('tab', {name: 'Map'}));
    expect(screen.getByTestId('map-view')).toBeInTheDocument();
  });

  it('is the workspace alone until the shelf holds the map editor', () => {
    const held = new Set<string>();
    shelf = {holds: unlock => held.has(`${unlock.kind}:${unlock.id}`)};
    open();
    expect(screen.getByTestId('world-view')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryByTestId('map-view')).toBeNull();
  });

  it('shows the view bar once the map editor is held', () => {
    shelf = {holds: unlock => unlock.kind === 'editor' && unlock.id === 'map'};
    open();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByTestId('map-view')).toBeInTheDocument();
  });
});
