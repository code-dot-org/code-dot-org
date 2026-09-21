import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import ScenesGallery from '@cdo/apps/p5lab/spritelab/lab2/views/ScenesGallery';

const scenes = [
  {id: 'a', name: 'Intro', thumbnail: '/thumb-a.png'},
  {id: 'b', name: 'Cave'},
];

function renderGallery(
  props: Partial<React.ComponentProps<typeof ScenesGallery>> = {}
) {
  const handlers = {
    onOpenScene: jest.fn(),
    onCreateScene: jest.fn(),
    onRenameScene: jest.fn(),
    onDeleteScene: jest.fn(),
    onMakeStartScene: jest.fn(),
  };
  render(
    <ScenesGallery
      scenes={scenes}
      activeSceneId="a"
      editable
      {...handlers}
      {...props}
    />
  );
  return handlers;
}

describe('ScenesGallery', () => {
  it('marks the first scene as where play starts', () => {
    renderGallery();
    expect(screen.getByText('Starts here')).toBeTruthy();
    // Only the other scene can be made the start.
    expect(screen.getAllByRole('button', {name: 'Start here'})).toHaveLength(1);
  });

  it('opens a scene from its tile', () => {
    const {onOpenScene} = renderGallery();
    fireEvent.click(screen.getByRole('button', {name: 'Open Cave'}));
    expect(onOpenScene).toHaveBeenCalledWith('b');
  });

  it('renames from the pencil, saving on Enter or the check', () => {
    const {onRenameScene} = renderGallery();
    fireEvent.click(screen.getByRole('button', {name: 'Rename Cave'}));
    const input = screen.getByRole('textbox', {name: 'Scene name'});
    fireEvent.change(input, {target: {value: '  Deep Cave '}});
    fireEvent.keyDown(input, {key: 'Enter'});
    expect(onRenameScene).toHaveBeenCalledWith('b', 'Deep Cave');

    fireEvent.click(screen.getByRole('button', {name: 'Rename Cave'}));
    fireEvent.change(screen.getByRole('textbox', {name: 'Scene name'}), {
      target: {value: 'Cavern'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Save name'}));
    expect(onRenameScene).toHaveBeenCalledWith('b', 'Cavern');
  });

  it('drops a blank name and cancels on the cross or Escape', () => {
    const {onRenameScene} = renderGallery();
    fireEvent.click(screen.getByRole('button', {name: 'Rename Cave'}));
    fireEvent.change(screen.getByRole('textbox', {name: 'Scene name'}), {
      target: {value: '   '},
    });
    expect(screen.getByRole('button', {name: 'Save name'})).toBeDisabled();
    fireEvent.click(screen.getByRole('button', {name: 'Cancel rename'}));
    expect(screen.queryByRole('textbox', {name: 'Scene name'})).toBeNull();

    fireEvent.click(screen.getByRole('button', {name: 'Rename Cave'}));
    fireEvent.keyDown(screen.getByRole('textbox', {name: 'Scene name'}), {
      key: 'Escape',
    });
    expect(screen.queryByRole('textbox', {name: 'Scene name'})).toBeNull();
    expect(onRenameScene).not.toHaveBeenCalled();
  });

  it('deletes only after confirming', () => {
    const {onDeleteScene} = renderGallery();
    fireEvent.click(screen.getAllByRole('button', {name: 'Delete'})[1]);
    expect(onDeleteScene).not.toHaveBeenCalled();
    expect(screen.getByText('Delete this scene?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Keep'}));
    expect(screen.queryByText('Delete this scene?')).toBeNull();

    fireEvent.click(screen.getAllByRole('button', {name: 'Delete'})[1]);
    // The confirming card now shows the red Delete in place of its own.
    fireEvent.click(screen.getAllByRole('button', {name: 'Delete'})[1]);
    expect(onDeleteScene).toHaveBeenCalledWith('b');
  });

  it('offers no delete for the last scene', () => {
    renderGallery({scenes: [scenes[0]]});
    expect(screen.queryByRole('button', {name: 'Delete'})).toBeNull();
  });

  it('makes another scene the start', () => {
    const {onMakeStartScene} = renderGallery();
    fireEvent.click(screen.getByRole('button', {name: 'Start here'}));
    expect(onMakeStartScene).toHaveBeenCalledWith('b');
  });

  it('hides every editing control when not editable', () => {
    renderGallery({editable: false});
    expect(screen.queryByRole('button', {name: 'Delete'})).toBeNull();
    expect(screen.queryByRole('button', {name: 'Start here'})).toBeNull();
    expect(screen.queryByText('New scene')).toBeNull();
    expect(screen.queryByRole('button', {name: 'Rename Cave'})).toBeNull();
    expect(screen.getByText('Cave')).toBeTruthy();
  });
});
