import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import PictureLibrary from '@cdo/apps/p5lab/spritelab/lab2/views/components/PictureLibrary';

const groups = [
  {
    type: 'sprite' as const,
    title: 'Characters',
    pictures: [
      {key: 'a', name: 'Sprite 1', thumb: 'data:a', src: 'data:a'},
      {key: 'b', name: 'Sprite 2', thumb: 'data:b', src: 'data:b'},
    ],
  },
  {
    type: 'background' as const,
    title: 'Backgrounds',
    pictures: [
      {key: 'c', name: 'Background 1', thumb: 'data:c', src: 'data:c'},
    ],
  },
];

describe('PictureLibrary', () => {
  it('titles a strip per kind, marks the chosen tile, and shows it large', () => {
    render(
      <PictureLibrary
        groups={groups}
        chosenKey="b"
        onChoose={jest.fn()}
        onNew={jest.fn()}
      />
    );
    expect(screen.getByRole('heading', {name: 'Characters'})).toBeTruthy();
    expect(screen.getByRole('heading', {name: 'Backgrounds'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Sprite 2'})).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('img', {name: 'Sprite 2'})).toBeTruthy();
  });

  it('chooses on a tile, makes on the button, and paints only when offered', () => {
    const onChoose = jest.fn();
    const onNew = jest.fn();
    const onPaint = jest.fn();
    const {rerender} = render(
      <PictureLibrary
        groups={groups}
        chosenKey="a"
        onChoose={onChoose}
        onNew={onNew}
      />
    );
    fireEvent.click(screen.getByRole('button', {name: 'Background 1'}));
    expect(onChoose).toHaveBeenCalledWith('c');
    fireEvent.click(screen.getByRole('button', {name: 'New image'}));
    expect(onNew).toHaveBeenCalled();
    expect(
      screen.queryByRole('button', {name: 'Edit with paint tools'})
    ).toBeNull();
    rerender(
      <PictureLibrary
        groups={groups}
        chosenKey="a"
        onChoose={onChoose}
        onNew={onNew}
        onPaint={onPaint}
      />
    );
    fireEvent.click(
      screen.getByRole('button', {name: 'Edit with paint tools'})
    );
    expect(onPaint).toHaveBeenCalled();
  });

  it('deletes only after asking, and withdraws the question on a new choice', () => {
    const onDelete = jest.fn();
    const {rerender} = render(
      <PictureLibrary
        groups={groups}
        chosenKey="a"
        onChoose={jest.fn()}
        onNew={jest.fn()}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByText('Delete this picture?')).toBeTruthy();
    rerender(
      <PictureLibrary
        groups={groups}
        chosenKey="b"
        onChoose={jest.fn()}
        onNew={jest.fn()}
        onDelete={onDelete}
      />
    );
    expect(screen.queryByText('Delete this picture?')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    // Asking swaps the button for Cancel and a confirming Delete.
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    expect(onDelete).toHaveBeenCalled();
  });
});
