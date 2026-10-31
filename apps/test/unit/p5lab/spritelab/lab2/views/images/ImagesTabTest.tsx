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
      onKeep,
      layout,
    }: {
      imageType: string;
      imageSubject?: string;
      typeChoice?: boolean;
      onKeep: (result: unknown) => void;
      layout: (parts: unknown) => React.ReactNode;
    }) => (
      <div>
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

// The pixel editor is stood in for: a stroke button and the parts a host
// lays out, with save handing back fixed pixels.
jest.mock('@cdo/apps/pixelEditor/PixelEditor', () => {
  const PixelEditorStub = ({
    tools,
    onEdit,
    onSave,
    children,
  }: {
    tools?: readonly string[];
    onEdit?: () => void;
    onSave: (dataURI: string, meta: {pixelGridSize?: number}) => void;
    children: (parts: unknown) => React.ReactNode;
  }) => {
    const [edited, setEdited] = React.useState(false);
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setEdited(true);
            onEdit?.();
          }}
        >
          stroke
        </button>
        <span>{tools ? `${tools.length} tools` : 'all tools'}</span>
        {children({
          ready: true,
          loadError: false,
          themeMode: 'light',
          toolbar: <span>toolbar</span>,
          canvas: <span>canvas</span>,
          save: () => onSave('data:png', {pixelGridSize: 1}),
          canSave: true,
          edited,
        })}
      </div>
    );
  };
  return {__esModule: true, default: PixelEditorStub};
});

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
const saveEdited = jest.fn();
const deleteImage = jest.fn();
const endSession = jest.fn();
jest.mock('@cdo/apps/p5lab/spritelab/lab2/views/images/useImageWriter', () => ({
  __esModule: true,
  default: () => ({
    acceptGenerated: (...args: unknown[]) => acceptGenerated(...args),
    saveEdited: (...args: unknown[]) => saveEdited(...args),
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

const pressed = () =>
  screen
    .getAllByRole('button', {pressed: true})
    .map(button => button.getAttribute('aria-label'));

describe('ImagesTab', () => {
  beforeEach(() => {
    Object.keys(propsByKey).forEach(key => delete propsByKey[key]);
    acceptGenerated.mockReset();
    saveEdited.mockReset();
    deleteImage.mockReset();
    endSession.mockReset();
  });

  it('opens a level about one image on the place it will go, and lands it there', async () => {
    propsByKey.k1 = {name: 'Background 1', categories: ['backgrounds']};
    renderTab({lockedImageType: 'sprite', imageRole: 'hero'});
    expect(pressed()).toEqual(['New character']);
    expect(screen.getByRole('img', {name: 'No picture yet'})).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'New image'})).toBeNull();
    acceptGenerated.mockImplementation(async () => {
      propsByKey.k2 = {name: 'Sprite 1', categories: [], role: 'hero'};
      return 'k2';
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: /^land sprite$/}));
    });
    expect(acceptGenerated).toHaveBeenCalledWith(
      {key: null, imageType: 'sprite', subject: undefined},
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
  });

  it('adds a draft in free play, one session per image', () => {
    propsByKey.k1 = {name: 'Sprite 1', categories: []};
    renderTab({editingOffered: true});
    expect(pressed()).toEqual(['Sprite 1']);
    fireEvent.click(screen.getByRole('button', {name: 'New image'}));
    expect(pressed()).toEqual(['New character']);
    expect(
      screen.getByRole('button', {name: 'land sprite character choice'})
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

  it('draws a new image in free play with every tool, and Done makes it an image', async () => {
    renderTab({editingOffered: true});
    fireEvent.click(screen.getByRole('button', {name: 'New image'}));
    fireEvent.click(screen.getByRole('button', {name: 'Draw my own'}));
    expect(screen.getByText('all tools')).toBeTruthy();
    expect(screen.getByText('toolbar')).toBeTruthy();
    const done = screen.getByRole('button', {name: 'Done drawing'});
    expect((done as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', {name: 'stroke'}));
    saveEdited.mockImplementation(async () => {
      propsByKey.k1 = {name: 'Sprite 1', categories: []};
      return 'k1';
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Done drawing'}));
    });
    expect(saveEdited).toHaveBeenCalledWith(
      {key: null, imageType: 'sprite', subject: 'character'},
      'data:png',
      {pixelGridSize: 1}
    );
    expect(screen.queryByText('canvas')).toBeNull();
    expect(pressed()).toEqual(['Sprite 1']);
  });

  it('edits an image with the few tools before free play, saving when the tab is left', async () => {
    propsByKey.k1 = {name: 'Sprite 1', categories: [], role: 'hero'};
    const {rerender} = renderTab({
      lockedImageType: 'sprite',
      imageRole: 'hero',
    });
    fireEvent.click(screen.getByRole('button', {name: 'Edit this image'}));
    expect(screen.getByText('3 tools')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'stroke'}));
    saveEdited.mockResolvedValue('k1');
    await act(async () => {
      rerender(
        <ImagesTab
          onDeleteImage={jest.fn()}
          paneWidth={280}
          lockedImageType="sprite"
          imageRole="hero"
          active={false}
        />
      );
    });
    expect(saveEdited).toHaveBeenCalledTimes(1);
    expect(saveEdited.mock.calls[0][0]).toEqual({
      key: 'k1',
      imageType: 'sprite',
      subject: undefined,
    });
    // Still drawing: the tab comes back to the tools.
    expect(screen.getByText('canvas')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));
    expect(screen.queryByText('canvas')).toBeNull();
  });
});
