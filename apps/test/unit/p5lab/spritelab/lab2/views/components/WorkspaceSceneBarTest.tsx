import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import WorkspaceSceneBar from '@cdo/apps/p5lab/spritelab/lab2/views/components/WorkspaceSceneBar';

const SCENES = [
  {id: 'a', name: 'Forest'},
  {id: 'b', name: 'Cave', thumbnail: 'data:image/png;base64,'},
];

function renderBar(props = {}) {
  const onSelectScene = jest.fn();
  const onManageScenes = jest.fn();
  render(
    <WorkspaceSceneBar
      scenes={SCENES}
      activeSceneId="b"
      onSelectScene={onSelectScene}
      onCreateScene={jest.fn()}
      onManageScenes={onManageScenes}
      rightExtra={<span>extra</span>}
      {...props}
    />
  );
  return {onSelectScene, onManageScenes};
}

describe('WorkspaceSceneBar', () => {
  it('names the current scene on the dropdown, then offers New scene, All scenes and the extra', () => {
    renderBar();
    expect(screen.getByRole('button', {name: 'Scene: Cave'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'New scene'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'All scenes'})).toBeTruthy();
    expect(screen.getByText('extra')).toBeTruthy();
  });

  it('lists every scene in the menu, the current one marked, and a pick selects it', () => {
    const {onSelectScene} = renderBar();
    fireEvent.click(screen.getByRole('button', {name: 'Scene: Cave'}));
    const items = screen
      .getByRole('list', {name: 'Scenes'})
      .querySelectorAll('button');
    expect([...items].map(b => b.textContent?.trim())).toEqual([
      'Forest',
      'Cave',
    ]);
    expect(items[1].getAttribute('aria-current')).toBe('true');
    fireEvent.click(items[0]);
    expect(onSelectScene).toHaveBeenCalledWith('a');
  });

  it('opens the gallery from All scenes', () => {
    const {onManageScenes} = renderBar();
    fireEvent.click(screen.getByRole('button', {name: 'All scenes'}));
    expect(onManageScenes).toHaveBeenCalled();
  });

  it('holds New scene and All scenes when locked', () => {
    renderBar({locked: true, lockedReason: 'Not here'});
    expect(screen.getByRole('button', {name: 'New scene'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'All scenes'})).toBeDisabled();
  });
});
