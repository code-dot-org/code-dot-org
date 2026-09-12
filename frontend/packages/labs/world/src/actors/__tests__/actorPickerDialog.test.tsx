// The actors, read as a grid.
//
// What is worth pinning here is the reading rather than the acts — every act is
// still the file menus' own (`files/FileMenus`). So: that an actor is a tile you
// press to open, that the two ways to get another are in the grid where the eye
// already is, and that a tile is identifiable before its picture has arrived.

import {render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {setActorIcons, setActorThumbnails} from '../../blockly/actorThumbnails';
import {ActorPickerDialog, type ActorTile} from '../ActorPickerDialog';

const ACTORS: ActorTile[] = [
  {fileId: 'a1', name: 'Player', moduleKey: 'actors/player'},
  {fileId: 'a2', name: 'Coin', moduleKey: 'actors/coin'},
];

const onOpen = vi.fn();
const onNew = vi.fn();
const onCancel = vi.fn();

const show = (props: Partial<Parameters<typeof ActorPickerDialog>[0]> = {}) =>
  render(
    <ActorPickerDialog
      actors={ACTORS}
      onOpen={onOpen}
      onNew={onNew}
      onCancel={onCancel}
      {...props}
    />,
  );

beforeEach(() => {
  vi.clearAllMocks();
  setActorThumbnails({});
  setActorIcons({});
});

describe('the actor grid', () => {
  it('gives every actor a tile that opens it', () => {
    show();

    const tile = screen.getByRole('button', {name: 'Open Player'});
    tile.click();
    expect(onOpen).toHaveBeenCalledWith('a1');
  });

  it('says the name as well as showing the thing', () => {
    // Unlike the sprite palette, which carries no text: an actor is a KIND
    // rather than a drawing, and two Crates that look alike are a real thing
    // to tell apart.
    show();

    expect(screen.getByText('Player')).toBeTruthy();
    expect(screen.getByText('Coin')).toBeTruthy();
  });

  it('holds the way to get another one, in the grid', () => {
    // ONE tile, not two. "From nothing" and "from the library" were a choice
    // made before the learner had said they wanted an actor; they are the
    // Actor Creator's first two doors now (`actors/create/ActorCreator`).
    show();

    expect(screen.queryByText('Import')).toBeNull();
    screen.getByText('New').click();
    expect(onNew).toHaveBeenCalled();
  });

  it('offers it not at all where nothing may be changed', () => {
    show({readOnly: true});

    expect(screen.queryByText('New')).toBeNull();
    // …and still shows what is there, which is the point of a locked level.
    expect(screen.getByRole('button', {name: 'Open Coin'})).toBeTruthy();
  });

  it('draws the picture when there is one, and the initial until then', () => {
    // A thumbnail is rendered by the sandbox and arrives after the world has
    // compiled, so a grid opened first is a grid of initials rather than a
    // grid of nothing.
    setActorThumbnails({'actors/player': 'data:image/png;base64,AAAA'});
    show();

    const drawn = screen
      .getByRole('button', {name: 'Open Player'})
      .querySelector('img');
    expect(drawn?.getAttribute('src')).toBe('data:image/png;base64,AAAA');
    expect(
      screen.getByRole('button', {name: 'Open Coin'}).querySelector('img'),
    ).toBeNull();
    expect(
      screen.getByRole('button', {name: 'Open Coin'}).textContent,
    ).toContain('C');
  });

  it('says when there is nothing to show', () => {
    show({actors: []});

    expect(screen.getByText('This project has no actors yet.')).toBeTruthy();
  });
});
