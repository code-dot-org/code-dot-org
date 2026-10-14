import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import SceneTabs from '@cdo/apps/p5lab/spritelab/lab2/views/SceneTabs';

const SCENES = [
  {id: 'a', name: 'Forest'},
  {id: 'b', name: 'Cave', thumbnail: 'data:image/png;base64,'},
];

function renderTabs(props = {}) {
  const onSelectScene = jest.fn();
  render(
    <SceneTabs
      scenes={SCENES}
      activeSceneId="b"
      galleryOpen={false}
      onSelectScene={onSelectScene}
      onCreateScene={jest.fn()}
      {...props}
    />
  );
  return {onSelectScene};
}

const tabNames = () =>
  screen.getAllByRole('tab').map(tab => tab.textContent?.trim());
const selectedNames = () =>
  screen
    .queryAllByRole('tab', {selected: true})
    .map(tab => tab.textContent?.trim());

describe('SceneTabs', () => {
  it('offers every scene as a tab, the current one selected', () => {
    renderTabs();
    expect(tabNames()).toEqual(['Forest', 'Cave']);
    expect(selectedNames()).toEqual(['Cave']);
    expect(screen.getByRole('button', {name: 'New scene'})).toBeTruthy();
  });

  it('selects a scene', () => {
    const {onSelectScene} = renderTabs();
    fireEvent.click(screen.getByRole('tab', {name: 'Forest'}));
    expect(onSelectScene).toHaveBeenCalledWith('a');
  });

  it('selects no scene while the map is open', () => {
    renderTabs({galleryOpen: true});
    expect(selectedNames()).toEqual([]);
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
