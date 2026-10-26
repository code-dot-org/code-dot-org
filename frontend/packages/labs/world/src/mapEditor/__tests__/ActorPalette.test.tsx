// The Actor Palette (specs/SHELL_PLAN.md, step 2).

import {fireEvent, render, screen, within} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {ActorPalette, type PaletteActor} from '../ActorPalette';

const ACTORS: PaletteActor[] = [
  {name: 'Player', path: 'actors/player', purpose: 'game'},
  {name: 'Label', path: 'actors/label', purpose: 'interface'},
  {name: 'Viewport', path: 'actors/viewport', purpose: 'interface'},
];

const renderPalette = (
  over: Partial<Parameters<typeof ActorPalette>[0]> = {},
) => {
  const props = {
    actors: ACTORS,
    startTab: 'game' as const,
    selected: null,
    onSelect: vi.fn(),
    onOpen: vi.fn(),
    onDelete: vi.fn(),
    onNew: vi.fn(),
    newWithheld: false,
    isReadOnly: false,
    ...over,
  };
  render(<ActorPalette {...props} />);
  return props;
};

const names = (tab: string) =>
  within(screen.getByRole('list', {name: `${tab} actors`}))
    .getAllByRole('button', {pressed: false})
    .map(button => button.textContent);

describe('the Actor Palette', () => {
  it('shows each tab its own actors', () => {
    renderPalette();
    expect(names('Game')).toEqual(['Player']);

    fireEvent.click(screen.getByRole('button', {name: 'Interface'}));
    expect(names('Interface')).toEqual(['Label', 'Viewport']);
  });

  it('opens on the tab it is given', () => {
    renderPalette({startTab: 'interface'});
    expect(names('Interface')).toEqual(['Label', 'Viewport']);
  });

  it('takes an actor in hand', () => {
    const props = renderPalette();
    fireEvent.click(screen.getByRole('button', {name: 'Player'}));
    expect(props.onSelect).toHaveBeenLastCalledWith('actors/player');
  });

  it('puts it down on a second press, and offers Open and Delete under it', () => {
    const props = renderPalette({selected: 'actors/player'});
    const inHand = screen.getByRole('button', {name: 'Player'});
    expect(inHand).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(inHand);
    expect(props.onSelect).toHaveBeenLastCalledWith(null);

    fireEvent.click(screen.getByRole('button', {name: 'Open'}));
    expect(props.onOpen).toHaveBeenCalledWith('actors/player');
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    expect(props.onDelete).toHaveBeenCalledWith('actors/player');
    // Only under the one in hand.
    expect(screen.getAllByRole('button', {name: 'Open'})).toHaveLength(1);
  });

  it('ends with Add New Actor', () => {
    const props = renderPalette();
    fireEvent.click(screen.getByRole('button', {name: 'Add New Actor'}));
    expect(props.onNew).toHaveBeenCalled();
  });

  it('offers neither Delete nor Add New Actor to a project that is read only', () => {
    renderPalette({selected: 'actors/player', isReadOnly: true});
    expect(screen.getByRole('button', {name: 'Open'})).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Delete'})).toBeNull();
    expect(screen.queryByRole('button', {name: 'Add New Actor'})).toBeNull();
  });
});

describe('dragging an actor out', () => {
  // An interface's actor may be dragged out to place one (DOCKING_PLAN.md,
  // step 9); a game's is the brush only.
  const transfer = () => ({
    setData: vi.fn(),
    setDragImage: vi.fn(),
    effectAllowed: '',
  });

  it('lets an actor for an interface be dragged, and says which', () => {
    const onDragOut = vi.fn();
    const props = renderPalette({onDragOut});
    // A game's is the brush only.
    expect(screen.getByRole('button', {name: 'Player'})).not.toHaveAttribute(
      'draggable',
    );
    fireEvent.click(screen.getByRole('button', {name: 'Interface'}));
    const label = screen.getByRole('button', {name: 'Label'});
    expect(label).toHaveAttribute('draggable', 'true');

    fireEvent.dragStart(label, {dataTransfer: transfer()});
    expect(onDragOut).toHaveBeenLastCalledWith('actors/label');
    fireEvent.dragEnd(label);
    expect(onDragOut).toHaveBeenLastCalledWith(null);
    // …and the brush is left as it was.
    expect(props.onSelect).not.toHaveBeenCalled();
  });

  it('drags nothing in a read-only project', () => {
    renderPalette({
      onDragOut: vi.fn(),
      isReadOnly: true,
      startTab: 'interface',
    });
    expect(screen.getByRole('button', {name: 'Label'})).not.toHaveAttribute(
      'draggable',
    );
  });
});
