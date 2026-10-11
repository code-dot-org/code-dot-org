import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import SceneTabs from '@cdo/apps/p5lab/spritelab/lab2/views/SceneTabs';

const SCENES = [
  {id: 'a', name: 'Forest'},
  {id: 'b', name: 'Cave', thumbnail: 'data:image/png;base64,'},
];

function renderTabs(props = {}) {
  const onSelectScene = jest.fn();
  const onManageScenes = jest.fn();
  render(
    <SceneTabs
      scenes={SCENES}
      activeSceneId="b"
      galleryOpen={false}
      onSelectScene={onSelectScene}
      onCreateScene={jest.fn()}
      onManageScenes={onManageScenes}
      {...props}
    />
  );
  return {onSelectScene, onManageScenes};
}

const tabNames = () =>
  screen.getAllByRole('tab').map(tab => tab.textContent?.trim());
const selectedNames = () =>
  screen
    .getAllByRole('tab', {selected: true})
    .map(tab => tab.textContent?.trim());

describe('SceneTabs', () => {
  it('leads with the map, then every scene as a tab, the current one selected', () => {
    renderTabs();
    expect(tabNames()).toEqual(['Scenes', 'Forest', 'Cave']);
    expect(selectedNames()).toEqual(['Cave']);
    expect(screen.getByRole('button', {name: 'New scene'})).toBeTruthy();
  });

  it('selects a scene and opens the gallery', () => {
    const {onSelectScene, onManageScenes} = renderTabs();
    fireEvent.click(screen.getByRole('tab', {name: 'Forest'}));
    expect(onSelectScene).toHaveBeenCalledWith('a');
    fireEvent.click(screen.getByRole('tab', {name: 'Scenes'}));
    expect(onManageScenes).toHaveBeenCalled();
  });

  it('holds World | Code inside the open scene tab only', () => {
    const onChange = jest.fn();
    renderTabs({editor: {value: 'Code', onChange}});
    const group = screen.getByRole('group', {name: 'Edit'});
    expect(
      screen.getByRole('tab', {name: 'Cave'}).parentElement?.contains(group)
    ).toBe(true);
    expect(
      screen.getByRole('button', {name: 'Code'}).getAttribute('aria-pressed')
    ).toBe('true');
    fireEvent.click(screen.getByRole('button', {name: 'World'}));
    expect(onChange).toHaveBeenCalledWith('World');
  });

  it('marks the gallery selected while it is open, and no scene', () => {
    renderTabs({galleryOpen: true});
    expect(selectedNames()).toEqual(['Scenes']);
  });

  it('withholds New scene when scenes cannot be made, and disables all while playing', () => {
    renderTabs({allowCreate: false, disabled: true});
    expect(screen.queryByRole('button', {name: 'New scene'})).toBeNull();
    expect(
      screen
        .getAllByRole('tab')
        .every(tab => (tab as HTMLButtonElement).disabled)
    ).toBe(true);
  });
});
