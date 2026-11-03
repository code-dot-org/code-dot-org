import {act, fireEvent, render, screen} from '@testing-library/react';
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
const images = [
  image('a', 'Sprite 1'),
  image('b', 'Sprite 2'),
  {...image('c', 'Background 1'), imageType: 'background' as const},
];

describe('ImageList', () => {
  it('names each kind over its tiles, the draft under its own kind', () => {
    render(
      <ImageList
        images={images}
        draft={{id: 'draft', imageType: 'sprite', subject: 'object'}}
        chosenId="draft"
        onChoose={jest.fn()}
      />
    );
    expect(
      screen.getAllByRole('heading', {level: 4}).map(h => h.textContent)
    ).toEqual(['Characters', 'Backgrounds', 'Objects']);
    expect(screen.getByRole('heading', {level: 3}).textContent).toBe(
      'Your images'
    );
    // The count leaves the draft out.
    expect(screen.getByText('3 images')).toBeTruthy();
    const list = screen.getByRole('region', {name: 'Your images'});
    const order = [...list.querySelectorAll('h4, button[aria-label]')].map(
      el => el.getAttribute('aria-label') ?? el.textContent
    );
    expect(order).toEqual([
      'Characters',
      'Sprite 1',
      'Sprite 2',
      'Backgrounds',
      'Background 1',
      'Objects',
      'New object',
    ]);
  });

  it('scrolls the tiles so a new slot shows whole, smoothly', () => {
    jest.useFakeTimers();
    const scrollTo = jest.fn();
    // The tiles box is 300px tall and scrolled to 0; the slot lands at 400.
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const slot = this.getAttribute('class')?.includes('tileSlot');
        return (
          slot
            ? {top: 400, bottom: 488, left: 0, right: 88, width: 88, height: 88}
            : {
                top: 0,
                bottom: 300,
                left: 0,
                right: 300,
                width: 300,
                height: 300,
              }
        ) as DOMRect;
      });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get: () => 300,
    });
    HTMLElement.prototype.scrollTo =
      scrollTo as unknown as typeof HTMLElement.prototype.scrollTo;
    const {rerender} = render(
      <ImageList
        images={[]}
        draft={null}
        chosenId={null}
        onChoose={jest.fn()}
      />
    );
    rerender(
      <ImageList
        images={[]}
        draft={{id: 'draft', imageType: 'sprite', subject: 'character'}}
        chosenId="draft"
        onChoose={jest.fn()}
      />
    );
    expect(scrollTo).not.toHaveBeenCalled();
    act(() => {
      jest.runOnlyPendingTimers();
    });
    // Bottom of the slot plus its margin, less the box's height.
    expect(scrollTo).toHaveBeenCalledWith({
      top: 488 + 8 - 300,
      behavior: 'smooth',
    });
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

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
    expect(
      ['Character', 'Background', 'Object', 'Block'].map(
        name => !!screen.getByRole('button', {name})
      )
    ).toEqual([true, true, true, true]);
    fireEvent.click(screen.getByRole('button', {name: 'Object'}));
    expect(onNew).toHaveBeenCalledWith({
      imageType: 'sprite',
      subject: 'object',
    });
    // The pick closes the menu.
    expect(document.querySelector('[class~="open"]')).toBeNull();
  });

  it("turns every kind but the level's off in the menu", () => {
    render(
      <ImageList
        images={images}
        draft={null}
        chosenId={null}
        onChoose={jest.fn()}
        onNew={jest.fn()}
        newKind={{imageType: 'sprite', subject: 'object'}}
      />
    );
    fireEvent.click(screen.getByRole('button', {name: 'New image'}));
    const off = (name: string) =>
      (screen.getByRole('button', {name}) as HTMLButtonElement).disabled;
    expect(['Character', 'Background', 'Object', 'Block'].map(off)).toEqual([
      true,
      true,
      false,
      true,
    ]);
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
    // The dialog shows which image, by its picture.
    const dialog = screen.getByRole('alertdialog');
    expect(dialog.querySelector('img')?.getAttribute('src')).toBe('data:b');
    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Delete image'}));
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    expect(onDelete).toHaveBeenCalledWith('b');
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
});
