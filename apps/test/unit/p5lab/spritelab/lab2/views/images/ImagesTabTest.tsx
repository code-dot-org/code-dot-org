import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {CHARACTER_STRIP_POSES} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import ImagesTab from '@cdo/apps/p5lab/spritelab/lab2/views/images/ImagesTab';
import type {SentenceSceneParts} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/SentenceScene';

// The scene is stood in for: a button that lands a picture of the kind it
// was given, so the tab's own moves can be watched.
// The player is a canvas that says which pose it plays.
jest.mock(
  '@cdo/apps/p5lab/spritelab/lab2/views/AnimatedSheetPreview',
  () => (props: {only?: string}) =>
    <canvas aria-label="Animation preview" data-only={props.only} />
);
jest.mock('@cdo/apps/p5lab/spritelab/lab2/views/sentence/SentenceScene', () => {
  const SentenceSceneStub = ({
    imageType,
    imageSubject,
    initialAnimated,
    onAnimatedChange,
    onBusyChange,
    onKeep,
    layout,
  }: {
    imageType: string;
    imageSubject?: string;
    initialAnimated?: boolean;
    onAnimatedChange?: (animated: boolean) => void;
    onBusyChange?: (busy: boolean) => void;
    onKeep: (result: unknown) => void;
    layout: (parts: unknown) => React.ReactNode;
  }) => {
    const [generating, setGenerating] = React.useState(false);
    return (
      <div>
        <button type="button" onClick={() => setGenerating(true)}>
          generate on
        </button>
        <button type="button" onClick={() => setGenerating(false)}>
          generate off
        </button>
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
              // Unique per picture, as the generator's are.
              filename: `made-${++picturesMade}.png`,
              uint8Array: new Uint8Array([137, 80, 78, 71]),
              mediaType: 'image/png',
              generation: {imageType, subject: imageSubject, prompt: 'A cat'},
            })
          }
        >
          land {imageType} {imageSubject ?? ''}
        </button>
        {layout({
          mode: generating ? 'generating' : 'edit',
          busy: generating,
          complete: false,
          panelRef: {current: null},
          frame: generating ? <span>spinner</span> : null,
          frameFilled: false,
          cachedTag: null,
          behindTheScenes: null,
          status: null,
          sentence: <span>words</span>,
          wordChooser: null,
          animatedChoice: null,
          error: null,
          tip: null,
          rating: {
            offered: false,
            required: false,
            verdict: null,
            judge: jest.fn(),
            explain: jest.fn(),
            dismiss: jest.fn(),
          },
          exhausted: false,
          generate: jest.fn(),
          draft: {imageType, subject: imageSubject, style: 'pixel'},
        } as SentenceSceneParts)}
      </div>
    );
  };
  return {__esModule: true, default: SentenceSceneStub};
});

// The pixel editor is stood in for: a stroke button and the parts a host
// lays out, with save handing back fixed pixels.
jest.mock('@cdo/apps/pixelEditor/PixelEditor', () => {
  const PixelEditorStub = ({
    tools,
    knownPixelGrid,
    onEdit,
    onSave,
    onHistoryChange,
    children,
  }: {
    tools?: readonly string[];
    knownPixelGrid?: number;
    onEdit?: () => void;
    onSave: (dataURI: string, meta: {pixelGridSize?: number}) => void;
    onHistoryChange?: (history: {canUndo: boolean}) => void;
    children: (parts: unknown) => React.ReactNode;
  }) => {
    const [edited, setEdited] = React.useState(false);
    React.useEffect(() => {
      onHistoryChange?.({canUndo: edited});
    }, [onHistoryChange, edited]);
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
        <span>grid {knownPixelGrid ?? 'none'}</span>
        {children({
          ready: true,
          loadError: false,
          themeMode: 'light',
          toolbar: <span>toolbar</span>,
          canvas: <span>canvas</span>,
          save: () => onSave('data:png', {pixelGridSize: 1}),
          snapshot: () => null,
          canSave: true,
          edited,
        })}
      </div>
    );
  };
  return {__esModule: true, default: PixelEditorStub};
});
// A real image element, since the frame row draws it onto a canvas.
jest.mock('@cdo/apps/imageUtils', () => ({
  toImage: async () => {
    const image = document.createElement('img');
    Object.defineProperty(image, 'naturalWidth', {value: 320});
    Object.defineProperty(image, 'naturalHeight', {value: 64});
    return image;
  },
}));

let picturesMade = 0;
// Frames are cut and put back without a canvas: the strip is named for
// what happened to it.
const cutFrame = jest.fn(
  async (src: string, _size: unknown, index: number) => `${src}#frame${index}`
);
const replaceFrame = jest.fn(
  async (src: string, _size: unknown, index: number, frame: string) =>
    `${src}+${index}:${frame}`
);
jest.mock('@cdo/apps/p5lab/spritelab/lab2/views/images/frames', () => ({
  ...jest.requireActual('@cdo/apps/p5lab/spritelab/lab2/views/images/frames'),
  cutFrame: (...args: unknown[]) =>
    cutFrame(...(args as [string, unknown, number])),
  replaceFrame: (...args: unknown[]) =>
    replaceFrame(...(args as [string, unknown, number, string])),
}));
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
const params: Record<string, string> = {};
jest.mock('@cdo/apps/code-studio/utils', () => ({
  queryParams: (name: string) => params[name],
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

// `hidden`: an open menu hides the rest of the page from assistive tech.
const pressed = () =>
  screen
    .queryAllByRole('button', {pressed: true, hidden: true})
    .map(button => button.getAttribute('aria-label'));

describe('ImagesTab', () => {
  beforeEach(() => {
    Object.keys(propsByKey).forEach(key => delete propsByKey[key]);
    Object.keys(params).forEach(key => delete params[key]);
    // These tests use the `pane` presentation of an edited image; the
    // paint-first default has tests of its own below.
    params['images-edited'] = 'pane';
    acceptGenerated.mockReset();
    saveEdited.mockReset();
    deleteImage.mockReset();
    delete params.learning;
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
      expect.objectContaining({
        filename: expect.stringMatching(/^made-\d+\.png$/),
      })
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

  it('offers the plus again on a level done before, until a new image lands', async () => {
    propsByKey.k1 = {name: 'Sprite 1', categories: [], role: 'hero'};
    const view = renderTab({lockedImageType: 'sprite', imageRole: 'hero'});
    expect(pressed()).toEqual(['Sprite 1']);
    fireEvent.click(screen.getByRole('button', {name: 'New image'}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'Character'}));
    expect(pressed()).toEqual(['New character']);
    acceptGenerated.mockImplementation(async () => {
      propsByKey.k2 = {name: 'Sprite 2', categories: [], role: 'hero'};
      return 'k2';
    });
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', {name: /^land sprite character$/})
      );
    });
    expect(pressed()).toEqual(['Sprite 2']);
    // The host counts the image as made on this visit; the plus then goes.
    view.rerender(
      <ImagesTab
        onDeleteImage={jest.fn()}
        paneWidth={280}
        lockedImageType="sprite"
        imageRole="hero"
        ownImageMade
      />
    );
    expect(screen.queryByRole('button', {name: 'New image'})).toBeNull();
    expect(screen.getByRole('button', {name: 'Sprite 1'})).toBeDisabled();
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
    // The kind is set by the pick.
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

  it('closes the tools on a deleted image without saving it', async () => {
    delete params['images-edited'];
    propsByKey.k1 = {name: 'Sprite 1', categories: [], sourceUrl: 'one.png'};
    propsByKey.k2 = {name: 'Sprite 2', categories: [], sourceUrl: 'two.png'};
    const {rerender} = renderTab({editingOffered: true});
    expect(await screen.findByText('canvas')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'stroke'}));
    fireEvent.click(screen.getByRole('button', {name: 'Delete image'}));
    deleteImage.mockImplementation(() => delete propsByKey.k1);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    await act(async () => {
      rerender(
        <ImagesTab onDeleteImage={jest.fn()} paneWidth={280} editingOffered />
      );
    });
    expect(pressed()).toEqual(['Sprite 2']);
    // The next image's tools open; the deleted image's pixels never went up.
    expect(await screen.findByText('canvas')).toBeTruthy();
    expect(saveEdited).not.toHaveBeenCalled();
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
    const onDrawingHistory = jest.fn();
    renderTab({editingOffered: true, onDrawingHistory});
    fireEvent.click(screen.getByRole('button', {name: 'New image'}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'Character'}));
    fireEvent.click(screen.getByRole('button', {name: 'Draw my own'}));
    expect(screen.getByText('4 tools')).toBeTruthy();
    expect(screen.getByText('toolbar')).toBeTruthy();
    const done = screen.getByRole('button', {name: 'Done drawing'});
    expect((done as HTMLButtonElement).disabled).toBe(true);
    // The host hears what undo can do, for its own buttons.
    expect(onDrawingHistory).toHaveBeenLastCalledWith({canUndo: false});
    fireEvent.click(screen.getByRole('button', {name: 'stroke'}));
    expect(onDrawingHistory).toHaveBeenLastCalledWith({canUndo: true});
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
      {pixelGridSize: 1},
      expect.objectContaining({upload: true})
    );
    expect(screen.queryByText('canvas')).toBeNull();
    expect(pressed()).toEqual(['Sprite 1']);
    expect(onDrawingHistory).toHaveBeenLastCalledWith(null);
  });

  it("saves a pause after each stroke, so the image is the project's as it is drawn", async () => {
    jest.useFakeTimers();
    const onImageLanded = jest.fn();
    renderTab({editingOffered: true, onImageLanded});
    fireEvent.click(screen.getByRole('button', {name: 'New image'}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'Character'}));
    fireEvent.click(screen.getByRole('button', {name: 'Draw my own'}));
    saveEdited.mockImplementation(async () => {
      propsByKey.k1 = {name: 'Sprite 1', categories: []};
      return 'k1';
    });
    fireEvent.click(screen.getByRole('button', {name: 'stroke'}));
    expect(saveEdited).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(800);
    });
    // The blank became an image, file and all, and the tools stayed open
    // on it; the project saves on its own clock, never forced by drawing.
    expect(saveEdited).toHaveBeenCalledTimes(1);
    expect(saveEdited.mock.calls[0][0]).toEqual({
      key: null,
      imageType: 'sprite',
      subject: 'character',
    });
    expect(saveEdited.mock.calls[0][3]).toMatchObject({upload: true});
    expect(onImageLanded).not.toHaveBeenCalled();
    expect(screen.getByText('canvas')).toBeTruthy();
    expect(pressed()).toEqual(['Sprite 1']);
    // The next pause saves onto that image, pixels only.
    fireEvent.click(screen.getByRole('button', {name: 'stroke'}));
    await act(async () => {
      jest.advanceTimersByTime(800);
    });
    expect(saveEdited).toHaveBeenCalledTimes(2);
    expect(saveEdited.mock.calls[1][0]).toEqual({
      key: 'k1',
      imageType: 'sprite',
      subject: 'character',
    });
    expect(saveEdited.mock.calls[1][3]).toMatchObject({upload: false});
    // Done sends the file those pixels are owed.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Done editing'}));
    });
    expect(saveEdited).toHaveBeenCalledTimes(3);
    expect(saveEdited.mock.calls[2][3]).toMatchObject({upload: true});
    expect(onImageLanded).not.toHaveBeenCalled();
    expect(screen.queryByText('canvas')).toBeNull();
    jest.useRealTimers();
  });

  it('keeps a stroke made while a save is in flight, saving it after', async () => {
    propsByKey.k1 = {name: 'Sprite 1', categories: [], role: 'hero'};
    renderTab({lockedImageType: 'sprite', imageRole: 'hero'});
    fireEvent.click(screen.getByRole('button', {name: 'Edit this image'}));
    let finishFirst: (key: string) => void = () => {};
    saveEdited.mockImplementationOnce(
      () => new Promise<string>(resolve => (finishFirst = resolve))
    );
    saveEdited.mockResolvedValue('k1');
    fireEvent.click(screen.getByRole('button', {name: 'stroke'}));
    act(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Done editing'}));
    });
    expect(saveEdited).toHaveBeenCalledTimes(1);
    // Another stroke and Done while the first save is out: it waits.
    fireEvent.click(screen.getByRole('button', {name: 'stroke'}));
    act(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Done editing'}));
    });
    expect(saveEdited).toHaveBeenCalledTimes(1);
    expect(screen.getByText('canvas')).toBeTruthy();
    await act(async () => {
      finishFirst('k1');
    });
    expect(saveEdited).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('canvas')).toBeNull();
  });

  it("guards an image that is the student's own work, until Replace image", () => {
    propsByKey.k1 = {name: 'Sprite 1', categories: [], edited: true};
    propsByKey.k2 = {
      name: 'Sprite 2',
      categories: [],
      generation: {imageType: 'sprite', prompt: 'A cat'},
    };
    const {rerender} = renderTab({editingOffered: true});
    // The edited image: its own pane, no words.
    expect(screen.getByText('Your edited image')).toBeTruthy();
    expect(screen.queryByText('words')).toBeNull();
    expect(screen.getByRole('button', {name: 'Edit this image'})).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Replace image'}));
    expect(screen.getByText('words')).toBeTruthy();
    expect(screen.queryByText('Your edited image')).toBeNull();
    // Leaving the tab and coming back puts the guard up again.
    rerender(
      <ImagesTab
        onDeleteImage={jest.fn()}
        paneWidth={280}
        editingOffered
        active={false}
      />
    );
    rerender(
      <ImagesTab onDeleteImage={jest.fn()} paneWidth={280} editingOffered />
    );
    expect(screen.getByText('Your edited image')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Replace image'}));
    expect(screen.getByText('words')).toBeTruthy();
    // The made image has its words from the start; back on the edited
    // one, the guard is up again.
    fireEvent.click(screen.getByRole('button', {name: 'Sprite 2'}));
    expect(screen.getByText('words')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Sprite 1'}));
    expect(screen.getByText('Your edited image')).toBeTruthy();
  });

  it('puts the paint tools away while a picture is made over the drawing', async () => {
    delete params['images-edited'];
    propsByKey.k1 = {name: 'Sprite 1', categories: [], sourceUrl: 'one.png'};
    renderTab({editingOffered: true});
    expect(await screen.findByText('canvas')).toBeTruthy();
    expect(screen.getByText('toolbar')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'generate on'}));
    expect(screen.getByText('spinner')).toBeTruthy();
    expect(screen.queryByText('toolbar')).toBeNull();
    expect(screen.queryByText('canvas')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'generate off'}));
    expect(screen.getByText('toolbar')).toBeTruthy();
    expect(screen.getByText('canvas')).toBeTruthy();
  });

  it('paints every image in place in free play, the words beside the tools', async () => {
    delete params['images-edited'];
    propsByKey.k1 = {
      name: 'Sprite 1',
      categories: [],
      edited: true,
      sourceUrl: 'sprite1.png',
    };
    propsByKey.k2 = {
      name: 'Sprite 2',
      categories: [],
      sourceUrl: 'sprite2.png',
      generation: {imageType: 'sprite', prompt: 'A cat'},
    };
    renderTab({editingOffered: true});
    // The edited image opens in the tools, with the words beside them and
    // nothing to finish.
    expect(await screen.findByText('canvas')).toBeTruthy();
    expect(screen.getByText('words')).toBeTruthy();
    expect(screen.queryByRole('button', {name: /^Done/})).toBeNull();
    expect(screen.queryByRole('button', {name: 'Edit this image'})).toBeNull();
    // So does the made one: the student can draw on it or make a picture
    // over it.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Sprite 2'}));
    });
    expect(screen.getByText('canvas')).toBeTruthy();
    expect(screen.getByText('words')).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Edit this image'})).toBeNull();
  });

  it("switches to another image's tools without a gap, saving the last one behind", async () => {
    delete params['images-edited'];
    propsByKey.k1 = {name: 'Sprite 1', categories: [], sourceUrl: 'one.png'};
    propsByKey.k2 = {name: 'Sprite 2', categories: [], sourceUrl: 'two.png'};
    let finishFirst: (key: string) => void = () => {};
    saveEdited.mockImplementationOnce(
      () => new Promise<string>(resolve => (finishFirst = resolve))
    );
    renderTab({editingOffered: true});
    expect(await screen.findByText('canvas')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'stroke'}));
    // The next image: the canvas stays up while its picture is decoded,
    // then its tools take over, while the first image's last pixels go
    // up with their file.
    fireEvent.click(screen.getByRole('button', {name: 'Sprite 2'}));
    expect(screen.getByText('canvas')).toBeTruthy();
    await act(async () => {});
    expect(screen.getByText('canvas')).toBeTruthy();
    expect(saveEdited).toHaveBeenCalledTimes(1);
    expect(saveEdited.mock.calls[0][0]).toEqual({
      key: 'k1',
      imageType: 'sprite',
      subject: undefined,
    });
    expect(saveEdited.mock.calls[0][3]).toMatchObject({upload: true});
    expect(pressed()).toEqual(['Sprite 2']);
    finishFirst('k1');
  });

  it('keeps the tools and the words open while a blank is drawn in free play', () => {
    delete params['images-edited'];
    renderTab({editingOffered: true});
    fireEvent.click(screen.getByRole('button', {name: 'New image'}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'Character'}));
    fireEvent.click(screen.getByRole('button', {name: 'Draw my own'}));
    expect(screen.getByText('canvas')).toBeTruthy();
    expect(screen.getByText('words')).toBeTruthy();
    expect(screen.queryByRole('button', {name: /^Done/})).toBeNull();
  });

  it('keeps Edit this image and Done on a level about one image', async () => {
    delete params['images-edited'];
    propsByKey.k1 = {
      name: 'Sprite 1',
      categories: [],
      role: 'hero',
      edited: true,
      sourceUrl: 'sprite1.png',
    };
    renderTab({lockedImageType: 'sprite', imageRole: 'hero'});
    expect(screen.queryByText('canvas')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Edit this image'}));
    expect(await screen.findByText('canvas')).toBeTruthy();
    expect(screen.queryByText('words')).toBeNull();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Done editing'}));
    });
    expect(screen.queryByText('canvas')).toBeNull();
    expect(screen.getByText('words')).toBeTruthy();
  });

  it('keeps the words under an edited image when the parameter asks', () => {
    params['images-edited'] = 'generate';
    propsByKey.k1 = {name: 'Sprite 1', categories: [], edited: true};
    renderTab({editingOffered: true});
    expect(screen.getByText('words')).toBeTruthy();
    expect(screen.queryByText('Your edited image')).toBeNull();
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
    // Leaving the tab is Done: the strokes are kept and the tools close.
    expect(screen.queryByText('canvas')).toBeNull();
  });

  it('tells how the picture was made after the first one on a level that asks, once', async () => {
    jest.useFakeTimers();
    renderTab({lockedImageType: 'sprite', imageRole: 'hero', learning: true});
    fireEvent.click(screen.getByRole('button', {name: 'New image'}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'Character'}));
    acceptGenerated.mockImplementation(async () => {
      propsByKey.k2 = {name: 'Sprite 1', categories: [], role: 'hero'};
      return 'k2';
    });
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', {name: /^land sprite character$/})
      );
    });
    expect(screen.queryByRole('alertdialog')).toBeNull();
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    const dialog = screen.getByRole('alertdialog', {
      name: 'How AI made your image',
    });
    expect(dialog).toBeTruthy();
    expect(screen.queryByRole('button', {name: /close/i})).toBeNull();
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', {name: 'Next'}));
    }
    fireEvent.click(screen.getByRole('button', {name: 'Got it'}));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    // Told once: the next picture of the kind passes quietly.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: /^land sprite$/}));
    });
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.queryByRole('alertdialog')).toBeNull();
    jest.useRealTimers();
  });

  it('holds the story while the tab is away, and tells it on return', async () => {
    jest.useFakeTimers();
    const {rerender} = renderTab({
      lockedImageType: 'sprite',
      imageRole: 'hero',
      learning: true,
    });
    fireEvent.click(screen.getByRole('button', {name: 'New image'}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'Character'}));
    acceptGenerated.mockImplementation(async () => {
      propsByKey.k2 = {name: 'Sprite 1', categories: [], role: 'hero'};
      return 'k2';
    });
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', {name: /^land sprite character$/})
      );
    });
    const away = (active: boolean) =>
      rerender(
        <ImagesTab
          onDeleteImage={jest.fn()}
          paneWidth={280}
          lockedImageType="sprite"
          imageRole="hero"
          learning
          active={active}
        />
      );
    away(false);
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    // Not over another tab.
    expect(screen.queryByRole('alertdialog')).toBeNull();
    away(true);
    expect(
      screen.getByRole('alertdialog', {name: 'How AI made your image'})
    ).toBeTruthy();
    jest.useRealTimers();
  });

  it('tells the story after every picture when the parameter asks', async () => {
    jest.useFakeTimers();
    params.learning = 'always';
    propsByKey.k1 = {name: 'Sprite 1', categories: []};
    renderTab({editingOffered: true});
    acceptGenerated.mockResolvedValue('k1');
    for (let i = 0; i < 2; i++) {
      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: /^land sprite/}));
      });
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      expect(
        screen.getByRole('alertdialog', {name: 'How AI made your image'})
      ).toBeTruthy();
      for (let step = 0; step < 4; step++) {
        fireEvent.click(screen.getByRole('button', {name: 'Next'}));
      }
      fireEvent.click(screen.getByRole('button', {name: 'Got it'}));
    }
    jest.useRealTimers();
  });

  it("shows a character set's frames before editing, and opens the tools on the picked one", async () => {
    propsByKey.k1 = {
      name: 'Sprite 1',
      categories: [],
      role: 'hero',
      sourceUrl: 'sheet.png',
      frameSize: {x: 64, y: 64},
      pixelGridSize: 1,
      poses: CHARACTER_STRIP_POSES,
    };
    renderTab({lockedImageType: 'sprite', imageRole: 'hero'});
    // The row stands under the frame with the standing frame chosen.
    expect(screen.getByRole('group', {name: 'Frames'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Standing'})).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    // The set's tile in the list plays the chosen frame's pose; no frame
    // tile plays.
    const playing = () =>
      screen
        .getByRole('button', {name: 'Sprite 1'})
        .querySelector('canvas[aria-label="Animation preview"]')
        ?.getAttribute('data-only');
    expect(playing()).toBe('stand-right');
    expect(
      screen
        .getByRole('group', {name: 'Frames'})
        .querySelector('canvas[aria-label="Animation preview"]')
    ).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Walk'}));
    expect(screen.getByRole('button', {name: 'Walk'})).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(playing()).toBe('walk-right');
    expect(cutFrame).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Edit this image'}));
    });
    expect(cutFrame).toHaveBeenCalledWith('sheet.png', {x: 64, y: 64}, 2);
    expect(screen.getByRole('button', {name: 'Walk'})).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    // A frame picked while the tools are open stays picked after Done.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Jump up'}));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: /^Done/}));
    });
    expect(screen.queryByText('Edit the jump up frame.')).toBeNull();
    expect(screen.getByRole('button', {name: 'Jump up'})).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(playing()).toBe('jump-right');
  });

  it('opens an AI-made set in the tools on the picked frame too', async () => {
    propsByKey.k1 = {
      name: 'Sprite 1',
      categories: [],
      role: 'hero',
      sourceUrl: 'sheet.png',
      frameSize: {x: 64, y: 64},
      pixelGridSize: 1,
      poses: CHARACTER_STRIP_POSES,
      generation: {imageType: 'sprite', prompt: 'A cat'},
    };
    renderTab({lockedImageType: 'sprite', imageRole: 'hero'});
    fireEvent.click(screen.getByRole('button', {name: 'Jump down'}));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Edit this image'}));
    });
    expect(cutFrame).toHaveBeenCalledWith('sheet.png', {x: 64, y: 64}, 4);
    expect(screen.getByRole('button', {name: 'Jump down'})).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('edits a character set one frame at a time, opening on the standing frame', async () => {
    propsByKey.k1 = {
      name: 'Sprite 1',
      categories: [],
      role: 'hero',
      sourceUrl: 'sheet.png',
      frameSize: {x: 64, y: 64},
      pixelGridSize: 1,
      poses: CHARACTER_STRIP_POSES,
    };
    renderTab({lockedImageType: 'sprite', imageRole: 'hero'});
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Edit this image'}));
    });
    expect(cutFrame).toHaveBeenCalledWith('sheet.png', {x: 64, y: 64}, 1);
    expect(screen.getByText('grid 1')).toBeTruthy();
    expect(screen.getByRole('group', {name: 'Frames'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Standing'})).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByText('Edit the standing frame.')).toBeTruthy();
    // A stroke, then another frame: the drawn frame goes back first.
    fireEvent.click(screen.getByRole('button', {name: 'stroke'}));
    saveEdited.mockResolvedValue('k1');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Walk'}));
    });
    expect(replaceFrame).toHaveBeenCalledWith(
      'sheet.png',
      {x: 64, y: 64},
      1,
      'data:png'
    );
    expect(saveEdited.mock.calls[0][1]).toBe('sheet.png+1:data:png');
    expect(screen.getByText('Edit the walk frame.')).toBeTruthy();
    expect(cutFrame).toHaveBeenLastCalledWith(
      'sheet.png+1:data:png',
      {x: 64, y: 64},
      2
    );
  });
});
