import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import ImagesTab from '@cdo/apps/p5lab/spritelab/lab2/views/images/ImagesTab';

// The scene is stood in for: a button that lands a picture of the kind it
// was given, so the tab's own moves can be watched.
jest.mock(
  '@cdo/apps/p5lab/spritelab/lab2/views/sentence/SentenceScene',
  () => ({
    __esModule: true,
    default: ({
      imageType,
      imageSubject,
      typeChoice,
      initialAnimated,
      onAnimatedChange,
      onBusyChange,
      onKeep,
      layout,
    }: {
      imageType: string;
      imageSubject?: string;
      typeChoice?: boolean;
      initialAnimated?: boolean;
      onAnimatedChange?: (animated: boolean) => void;
      onBusyChange?: (busy: boolean) => void;
      onKeep: (result: unknown) => void;
      layout: (parts: unknown) => React.ReactNode;
    }) => (
      <div>
        <button type="button" onClick={() => onBusyChange?.(true)}>
          busy on
        </button>
        <button type="button" onClick={() => onBusyChange?.(false)}>
          busy off
        </button>
        <span>animated {String(initialAnimated)}</span>
        <button type="button" onClick={() => onAnimatedChange?.(false)}>
          animated off
        </button>
        <button
          type="button"
          onClick={() =>
            onKeep({
              filename: 'made.png',
              generation: {imageType, subject: imageSubject},
            })
          }
        >
          land {imageType} {imageSubject ?? ''} {typeChoice ? 'choice' : ''}
        </button>
        {layout({
          mode: 'edit',
          busy: false,
          complete: false,
          panelRef: {current: null},
          frame: null,
          frameFilled: false,
          underFrame: null,
          alternatives: null,
          status: null,
          typeChoice: null,
          sentence: <span>words</span>,
          error: null,
          progress: null,
          fact: null,
          verdict: null,
          awaitingVerdict: false,
          exhausted: false,
          generate: jest.fn(),
          changeWords: jest.fn(),
          keep: jest.fn(),
          draft: {imageType, subject: imageSubject, style: 'pixel'},
        })}
      </div>
    ),
  })
);

const propsByKey: Record<string, Record<string, unknown>> = {};
const animationList = () => ({
  orderedKeys: Object.keys(propsByKey),
  propsByKey,
});
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: (select: (state: unknown) => unknown) =>
    select({animationList: animationList(), lab: {}}),
  useAppDispatch: () => jest.fn(),
}));
jest.mock('@cdo/apps/p5lab/spritelab/lab2/imageTrim', () => ({
  onTrimsUpdated: () => () => undefined,
  trimAnimationListImages: () => undefined,
  getImageThumbnail: () => undefined,
}));
const acceptGenerated = jest.fn();
const deleteImage = jest.fn();
const endSession = jest.fn();
jest.mock('@cdo/apps/p5lab/spritelab/lab2/views/images/useImageWriter', () => ({
  __esModule: true,
  default: () => ({
    acceptGenerated: (...args: unknown[]) => acceptGenerated(...args),
    saveEdited: jest.fn(),
    deleteImage: (...args: unknown[]) => deleteImage(...args),
    endSession: () => endSession(),
  }),
}));

function renderTab(
  props: Partial<React.ComponentProps<typeof ImagesTab>> = {}
) {
  return render(
    <ImagesTab onDeleteImage={jest.fn()} paneWidth={280} {...props} />
  );
}

// `hidden`: an open menu hides the rest of the page from assistive tech.
const pressed = () =>
  screen
    .queryAllByRole('button', {pressed: true, hidden: true})
    .map(button => button.getAttribute('aria-label'));

describe('ImagesTab', () => {
  beforeEach(() => {
    Object.keys(propsByKey).forEach(key => delete propsByKey[key]);
    acceptGenerated.mockReset();
    deleteImage.mockReset();
    endSession.mockReset();
  });

  it('opens a level about one image on the place it will go, and lands it there', async () => {
    propsByKey.k1 = {name: 'Background 1', categories: ['backgrounds']};
    renderTab({lockedImageType: 'sprite', imageRole: 'hero'});
    // No slot until the plus is pressed and the level's kind picked; the
    // other kinds are shown but off, as practice for free play.
    expect(pressed()).toEqual([]);
    expect(screen.getByText('Press + to make a character.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'New image'}));
    expect(
      screen
        .getByRole('menuitem', {name: 'Background'})
        .getAttribute('aria-disabled') === 'true'
    ).toBe(true);
    fireEvent.click(screen.getByRole('menuitem', {name: 'Character'}));
    expect(pressed()).toEqual(['New character']);
    expect(screen.getByRole('img', {name: 'No picture yet'})).toBeTruthy();
    acceptGenerated.mockImplementation(async () => {
      propsByKey.k2 = {name: 'Sprite 1', categories: [], role: 'hero'};
      return 'k2';
    });
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', {name: /^land sprite character$/})
      );
    });
    expect(acceptGenerated).toHaveBeenCalledWith(
      {key: null, imageType: 'sprite', subject: 'character'},
      expect.objectContaining({filename: 'made.png'})
    );
    expect(pressed()).toEqual(['Sprite 1']);
    expect(screen.queryByRole('button', {name: 'New character'})).toBeNull();
  });

  it('opens on the level image when it already exists', () => {
    propsByKey.k1 = {name: 'Sprite 1', categories: [], role: 'hero'};
    propsByKey.k2 = {name: 'Sprite 2', categories: [], role: 'friend'};
    renderTab({lockedImageType: 'sprite', imageRole: 'friend'});
    expect(pressed()).toEqual(['Sprite 2']);
    expect(screen.getByRole('button', {name: /^land sprite/})).toBeTruthy();
    // The choice stays there: the project's other images are off.
    expect(screen.getByRole('button', {name: 'Sprite 1'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Sprite 2'})).toBeEnabled();
    fireEvent.click(screen.getByRole('button', {name: 'Sprite 1'}));
    expect(pressed()).toEqual(['Sprite 2']);
  });

  it('adds a draft of the kind picked under the plus, one session per image', () => {
    propsByKey.k1 = {name: 'Sprite 1', categories: []};
    renderTab({editingOffered: true});
    expect(pressed()).toEqual(['Sprite 1']);
    fireEvent.click(screen.getByRole('button', {name: 'New image'}));
    // Nothing is set up until a kind is picked.
    expect(pressed()).toEqual(['Sprite 1']);
    fireEvent.click(screen.getByRole('menuitem', {name: 'Character'}));
    expect(pressed()).toEqual(['New character']);
    // The kind is settled by the pick: no Type choice in the scene.
    expect(
      screen.getByRole('button', {name: 'land sprite character'})
    ).toBeTruthy();
    expect(endSession).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', {name: 'Sprite 1'}));
    expect(pressed()).toEqual(['Sprite 1']);
    expect(endSession).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('button', {name: 'New character'})).toBeNull();
  });

  it('says so where the level has no images and no adding', () => {
    renderTab();
    expect(screen.getByText('This level has no images to make.')).toBeTruthy();
  });

  it('keeps the image the student moved to while a new picture was landing', async () => {
    propsByKey.k1 = {name: 'Sprite 1', categories: []};
    const {rerender} = renderTab({editingOffered: true});
    fireEvent.click(screen.getByRole('button', {name: 'New image'}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'Character'}));
    let finish: (key: string) => void = () => {};
    acceptGenerated.mockImplementation(
      () =>
        new Promise<string>(resolve => {
          finish = key => {
            propsByKey.k2 = {name: 'Sprite 2', categories: []};
            resolve(key);
          };
        })
    );
    fireEvent.click(screen.getByRole('button', {name: /^land sprite/}));
    fireEvent.click(screen.getByRole('button', {name: 'Sprite 1'}));
    expect(pressed()).toEqual(['Sprite 1']);
    await act(async () => {
      finish('k2');
    });
    // The student's choice stands. (The store would prompt the next render
    // outside this test.)
    rerender(
      <ImagesTab onDeleteImage={jest.fn()} paneWidth={280} editingOffered />
    );
    expect(screen.getByRole('button', {name: 'Sprite 2'})).toBeTruthy();
    expect(pressed()).toEqual(['Sprite 1']);
  });

  it('leaves Animated on until the student turns it off, and keeps their choice', () => {
    propsByKey.k1 = {name: 'Sprite 1', categories: []};
    propsByKey.k2 = {name: 'Sprite 2', categories: []};
    renderTab({editingOffered: true});
    // A plain image does not turn it off.
    expect(screen.getByText('animated true')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'animated off'}));
    fireEvent.click(screen.getByRole('button', {name: 'Sprite 2'}));
    expect(screen.getByText('animated false')).toBeTruthy();
  });

  it('holds the list still while a picture is being made', () => {
    propsByKey.k1 = {name: 'Sprite 1', categories: []};
    propsByKey.k2 = {name: 'Sprite 2', categories: []};
    renderTab({editingOffered: true});
    fireEvent.click(screen.getByRole('button', {name: 'busy on'}));
    const tile = screen.getByRole('button', {
      name: 'Sprite 2',
    }) as HTMLButtonElement;
    expect(tile.disabled).toBe(true);
    expect(
      (screen.getByRole('button', {name: 'New image'}) as HTMLButtonElement)
        .disabled
    ).toBe(true);
    expect(
      (screen.getByRole('button', {name: 'Delete image'}) as HTMLButtonElement)
        .disabled
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', {name: 'busy off'}));
    expect(tile.disabled).toBe(false);
  });

  it('deletes through the list and moves on to the next image', () => {
    propsByKey.k1 = {name: 'Sprite 1', categories: []};
    propsByKey.k2 = {name: 'Sprite 2', categories: []};
    const {rerender} = renderTab({editingOffered: true});
    fireEvent.click(screen.getByRole('button', {name: 'Delete image'}));
    deleteImage.mockImplementation(() => delete propsByKey.k1);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    expect(deleteImage).toHaveBeenCalledWith('k1');
    rerender(
      <ImagesTab onDeleteImage={jest.fn()} paneWidth={280} editingOffered />
    );
    expect(pressed()).toEqual(['Sprite 2']);
  });
});
