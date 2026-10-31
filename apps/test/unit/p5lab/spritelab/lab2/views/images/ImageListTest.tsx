import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import ImageList from '@cdo/apps/p5lab/spritelab/lab2/views/images/ImageList';
import {ProjectImage} from '@cdo/apps/p5lab/spritelab/lab2/views/images/projectImages';

const image = (key: string, name: string): ProjectImage => ({
  key,
  props: {name},
  name,
  imageType: 'sprite',
  thumb: `data:${key}`,
  src: `data:${key}`,
  pixelated: false,
});
const images = [image('a', 'Sprite 1'), image('b', 'Sprite 2')];

describe('ImageList', () => {
  it('lists the images and the draft, marking the chosen one', () => {
    render(
      <ImageList
        images={images}
        draft={{id: 'draft', imageType: 'background'}}
        chosenId="draft"
        onChoose={jest.fn()}
      />
    );
    expect(screen.getByRole('button', {name: 'Sprite 1'})).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(
      screen.getByRole('button', {name: 'New background'})
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', {name: 'New image'})).toBeNull();
    expect(screen.queryByRole('button', {name: 'Delete image'})).toBeNull();
  });

  it('chooses on a tile and adds on the plus', () => {
    const onChoose = jest.fn();
    const onNew = jest.fn();
    render(
      <ImageList
        images={images}
        draft={null}
        chosenId="a"
        onChoose={onChoose}
        onNew={onNew}
      />
    );
    fireEvent.click(screen.getByRole('button', {name: 'Sprite 2'}));
    expect(onChoose).toHaveBeenCalledWith('b');
    fireEvent.click(screen.getByRole('button', {name: 'New image'}));
    expect(onNew).toHaveBeenCalled();
  });

  it('deletes the chosen image only after asking', () => {
    const onDelete = jest.fn();
    render(
      <ImageList
        images={images}
        draft={null}
        chosenId="b"
        onChoose={jest.fn()}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getByRole('button', {name: 'Delete image'}));
    expect(onDelete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));
    expect(screen.getByRole('button', {name: 'Delete image'})).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Delete image'}));
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    expect(onDelete).toHaveBeenCalledWith('b');
  });
});
