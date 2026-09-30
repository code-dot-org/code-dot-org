import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import ScenesGallery from '../ScenesGallery';

const scenes = [
  {id: 'a', name: 'Forest'},
  {id: 'b', name: 'Cave'},
];

function renderGallery(editable = true) {
  const handlers = {
    onOpenScene: vi.fn(),
    onCreateScene: vi.fn(),
    onRenameScene: vi.fn(),
    onDeleteScene: vi.fn(),
    onMakeStartScene: vi.fn(),
  };
  render(
    <ScenesGallery
      scenes={scenes}
      activeSceneId="a"
      editable={editable}
      {...handlers}
    />,
  );
  return handlers;
}

describe('ScenesGallery', () => {
  it('opens a scene from its card', () => {
    const {onOpenScene} = renderGallery();
    fireEvent.click(screen.getByRole('button', {name: 'Open Cave'}));
    expect(onOpenScene).toHaveBeenCalledWith('b');
  });

  it('offers Start here on every scene but the first', () => {
    const {onMakeStartScene} = renderGallery();
    const startButtons = screen.getAllByRole('button', {name: 'Start here'});
    expect(startButtons).toHaveLength(1);
    fireEvent.click(startButtons[0]);
    expect(onMakeStartScene).toHaveBeenCalledWith('b');
  });

  it('asks before deleting a scene', () => {
    const {onDeleteScene} = renderGallery();
    fireEvent.click(screen.getAllByRole('button', {name: 'Delete'})[0]);
    expect(onDeleteScene).not.toHaveBeenCalled();
    expect(screen.getByText('Delete this scene?')).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button', {name: 'Delete'})[0]);
    expect(onDeleteScene).toHaveBeenCalledWith('a');
  });

  it('offers no edits when not editable', () => {
    renderGallery(false);
    expect(screen.queryByText('New scene')).toBeNull();
    expect(screen.queryByRole('button', {name: 'Start here'})).toBeNull();
    expect(screen.queryByRole('button', {name: 'Rename Forest'})).toBeNull();
  });
});
