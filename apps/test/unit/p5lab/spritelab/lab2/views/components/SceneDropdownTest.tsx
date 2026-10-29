import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import SceneDropdown from '@cdo/apps/p5lab/spritelab/lab2/views/components/SceneDropdown';

const SCENES = [
  {id: 'a', name: 'Forest'},
  {id: 'b', name: 'Cave', thumbnail: 'data:image/png;base64,'},
];

function renderDropdown(props = {}) {
  const onSelectScene = jest.fn();
  const onManageScenes = jest.fn();
  render(
    <SceneDropdown
      scenes={SCENES}
      activeSceneId="b"
      onSelectScene={onSelectScene}
      onCreateScene={jest.fn()}
      {...props}
    />
  );
  return {onSelectScene, onManageScenes};
}

const menuNames = () =>
  [
    ...screen.getByRole('list', {name: 'Scenes'}).querySelectorAll('button'),
  ].map(b => b.textContent?.trim());

describe('SceneDropdown', () => {
  it('names the current scene, and lists every scene with New scene under them', () => {
    const {onSelectScene} = renderDropdown();
    fireEvent.click(screen.getByRole('button', {name: 'Scene: Cave'}));
    expect(menuNames()).toEqual(['Forest', 'Cave', 'New scene…']);
    const items = screen
      .getByRole('list', {name: 'Scenes'})
      .querySelectorAll('button');
    expect(items[1].getAttribute('aria-current')).toBe('true');
    fireEvent.click(items[0]);
    expect(onSelectScene).toHaveBeenCalledWith('a');
  });

  it('adds All scenes to the menu when given somewhere to go', () => {
    const onManageScenes = jest.fn();
    renderDropdown({onManageScenes});
    fireEvent.click(screen.getByRole('button', {name: 'Scene: Cave'}));
    expect(menuNames()).toEqual([
      'Forest',
      'Cave',
      'New scene…',
      'All scenes…',
    ]);
    fireEvent.click(screen.getByRole('button', {name: 'All scenes…'}));
    expect(onManageScenes).toHaveBeenCalled();
  });

  it('holds New scene when locked', () => {
    renderDropdown({locked: true, lockedReason: 'Not here'});
    fireEvent.click(screen.getByRole('button', {name: 'Scene: Cave'}));
    expect(screen.getByRole('button', {name: 'New scene…'})).toBeDisabled();
  });

  it('leaves New scene out when creating is off', () => {
    renderDropdown({allowCreate: false});
    fireEvent.click(screen.getByRole('button', {name: 'Scene: Cave'}));
    expect(menuNames()).toEqual(['Forest', 'Cave']);
  });
});
