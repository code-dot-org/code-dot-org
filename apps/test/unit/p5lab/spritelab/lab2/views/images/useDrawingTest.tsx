import {act, render} from '@testing-library/react';
import React, {useEffect} from 'react';

import {ProjectImage} from '@cdo/apps/p5lab/spritelab/lab2/views/images/projectImages';
import useDrawing, {
  DrawingTools,
} from '@cdo/apps/p5lab/spritelab/lab2/views/images/useDrawing';
import {
  ImageTarget,
  ImageWriter,
} from '@cdo/apps/p5lab/spritelab/lab2/views/images/useImageWriter';

// The picture decodes at once.
jest.mock('@cdo/apps/imageUtils', () => ({
  toImage: async () => ({decode: async () => undefined}),
}));

// A strip is a string of the frames saved into it, so a test can read them.
jest.mock('@cdo/apps/p5lab/spritelab/lab2/views/images/frames', () => ({
  cutFrame: async (src: string, _size: unknown, index: number) =>
    `${src}#${index}`,
  replaceFrame: async (
    src: string,
    _size: unknown,
    index: number,
    frame: string
  ) => `${src}|${index}=${frame}`,
  frameCount: () => 3,
}));

const sendEvent = jest.fn();
jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: (...args: unknown[]) => sendEvent(...args)},
}));

const images: ProjectImage[] = [
  {
    key: 'k1',
    props: {name: 'Sprite 1'},
    name: 'Sprite 1',
    imageType: 'sprite',
    src: 'data:one',
    pixelated: false,
  },
  {
    key: 'k2',
    props: {
      name: 'Sprite 2',
      generation: {} as NonNullable<ProjectImage['props']['generation']>,
    },
    name: 'Sprite 2',
    imageType: 'sprite',
    src: 'data:two',
    pixelated: false,
  },
  {
    key: 'k4',
    props: {name: 'Set'},
    name: 'Set',
    imageType: 'sprite',
    src: 'data:set',
    pixelated: false,
    sheet: {
      src: 'strip',
      frameSize: {x: 64, y: 64},
      poses: {} as NonNullable<ProjectImage['sheet']>['poses'],
    },
  },
];
const target = {key: 'k1', imageType: 'sprite' as const};

/** Renders the hook and hands back its latest tools. */
function setup(saveProjectNow = jest.fn()) {
  const saveEdited = jest.fn() as jest.MockedFunction<
    ImageWriter['saveEdited']
  >;
  saveEdited.mockResolvedValue('k1');
  const storePicture = jest.fn(
    async (
      _target: unknown,
      write: () => Promise<string>,
      _saveNow?: boolean
    ) => write()
  );
  const latest: {tools?: DrawingTools} = {};
  const Harness = () => {
    const tools = useDrawing({
      images,
      saveEdited,
      storePicture,
      active: true,
      saveProjectNow,
    });
    useEffect(() => {
      latest.tools = tools;
    });
    return null;
  };
  const view = render(<Harness />);
  const tools = () => latest.tools!;
  // The tools are read at render; a change that sets no state needs one.
  const rerender = () => view.rerender(<Harness />);
  return {
    saveEdited,
    storePicture,
    saveProjectNow,
    tools,
    rerender,
    unmount: view.unmount,
  };
}

const editor = () => ({save: jest.fn(), snapshot: jest.fn(() => null)});

describe('useDrawing', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    ['blank', {key: null, imageType: 'sprite' as const}],
    ['other', target],
    ['generated', {key: 'k2', imageType: 'sprite' as const}],
  ])("reports a %s drawing's first edit once", async (origin, drawTarget) => {
    jest.useFakeTimers();
    sendEvent.mockClear();
    const {tools} = setup();
    await act(() => tools().startDrawing(drawTarget));
    tools().attachEditor(editor());
    expect(sendEvent).not.toHaveBeenCalled();
    act(() => tools().scheduleStrokeSave());
    act(() => tools().scheduleStrokeSave());
    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledWith(
      'hoai2026-image-draw',
      expect.objectContaining({origin, imageType: 'sprite'}),
      true
    );
  });

  it('says nothing on the next drawing when a left drawing fails to save', async () => {
    const {saveEdited, tools} = setup();
    await act(() => tools().startDrawing(target));
    // The editor hands its pixels over as soon as it is asked to save.
    tools().attachEditor({
      save: () => tools().handleSave('data:a', {}),
      snapshot: () => null,
    });
    let fail: (error: Error) => void = () => undefined;
    saveEdited.mockImplementationOnce(
      () => new Promise<string>((_resolve, reject) => (fail = reject))
    );
    act(() => tools().scheduleStrokeSave());
    await act(async () => tools().leaveDrawing(true));
    expect(saveEdited).toHaveBeenCalledTimes(1);
    await act(() => tools().startDrawing(target));
    const next = editor();
    tools().attachEditor(next);
    await act(async () => fail(new Error('down')));
    expect(tools().saveFailed).toBe(false);
    // The next drawing was not drawn on, so leaving it saves nothing.
    act(() => tools().leaveDrawing());
    expect(next.save).not.toHaveBeenCalled();
  });

  it("drops an abandoned drawing's running save, which is no longer wanted", async () => {
    const {saveEdited, tools} = setup();
    await act(() => tools().startDrawing(target));
    tools().attachEditor(editor());
    let finish: (key: string) => void = () => undefined;
    saveEdited.mockImplementationOnce(
      () => new Promise<string>(resolve => (finish = resolve))
    );
    await act(async () => tools().handleSave('data:a', {}));
    const options = saveEdited.mock.calls[0]![3]!;
    expect(options.stillWanted?.()).toBe(true);
    act(() => tools().abandonDrawing());
    expect(tools().drawing).toBeNull();
    expect(options.stillWanted?.()).toBe(false);
    await act(async () => finish('k1'));
    expect(tools().drawing).toBeNull();
  });

  it("drops an abandoned drawing's save that has not started", async () => {
    const {saveEdited, tools} = setup();
    await act(() => tools().startDrawing(target));
    tools().attachEditor(editor());
    act(() => {
      tools().handleSave('data:a', {});
      tools().abandonDrawing();
    });
    await act(async () => undefined);
    expect(saveEdited).not.toHaveBeenCalled();
  });

  it('saves the project once Done has saved what is drawn, and not on a pause', async () => {
    const {storePicture, saveProjectNow, tools} = setup();
    await act(() => tools().startDrawing(target));
    tools().attachEditor({
      save: () => tools().handleSave('data:b', {}),
      snapshot: () => null,
    });
    await act(async () => tools().handleSave('data:a', {}));
    expect(saveProjectNow).not.toHaveBeenCalled();
    act(() => tools().scheduleStrokeSave());
    await act(async () => tools().finishDrawing());
    expect(storePicture.mock.calls.map(call => call[2])).toEqual([
      false,
      false,
    ]);
    expect(saveProjectNow).toHaveBeenCalledTimes(1);
    expect(tools().drawing).toBeNull();
  });

  it('keeps the tools open, with the failure shown, when Done cannot save', async () => {
    const {saveEdited, saveProjectNow, tools} = setup();
    await act(() => tools().startDrawing(target));
    tools().attachEditor({
      save: () => tools().handleSave('data:a', {}),
      snapshot: () => null,
    });
    saveEdited.mockRejectedValueOnce(new Error('down'));
    act(() => tools().scheduleStrokeSave());
    await act(async () => tools().finishDrawing());
    expect(tools().drawing).not.toBeNull();
    expect(tools().saveFailed).toBe(true);
    expect(saveProjectNow).not.toHaveBeenCalled();
  });

  it("saves the project after a left drawing's running save, and saves no picture again when nothing new was drawn", async () => {
    const {saveEdited, saveProjectNow, tools} = setup();
    await act(() => tools().startDrawing(target));
    tools().attachEditor({
      save: () => tools().handleSave('data:extra', {}),
      snapshot: () => null,
    });
    let finishSave: (key: string) => void = () => undefined;
    saveEdited.mockImplementationOnce(
      () => new Promise<string>(resolve => (finishSave = resolve))
    );
    await act(async () => tools().handleSave('data:a', {}));
    act(() => tools().leaveDrawing());
    expect(saveProjectNow).not.toHaveBeenCalled();
    await act(async () => finishSave('k1'));
    expect(saveEdited.mock.calls.map(call => call[1])).toEqual(['data:a']);
    expect(saveProjectNow).toHaveBeenCalledTimes(1);
  });

  it('saves what is drawn and then the project when the level is left', async () => {
    const {saveEdited, saveProjectNow, tools, unmount} = setup();
    await act(() => tools().startDrawing(target));
    tools().attachEditor({
      save: () => tools().handleSave('data:last', {}),
      snapshot: () => null,
    });
    let finishSave: (key: string) => void = () => undefined;
    saveEdited.mockImplementationOnce(
      () => new Promise<string>(resolve => (finishSave = resolve))
    );
    await act(async () => tools().handleSave('data:a', {}));
    act(() => tools().scheduleStrokeSave());
    unmount();
    expect(saveProjectNow).not.toHaveBeenCalled();
    await act(async () => {
      finishSave('k1');
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(saveEdited.mock.calls.map(call => call[1])).toEqual([
      'data:a',
      'data:last',
    ]);
    expect(saveProjectNow).toHaveBeenCalledTimes(1);
  });

  it('retries a failed pause-save at the next save', async () => {
    const {saveEdited, tools} = setup();
    await act(() => tools().startDrawing(target));
    tools().attachEditor(editor());
    saveEdited.mockRejectedValueOnce(new Error('down'));
    await act(async () => tools().handleSave('data:a', {}));
    expect(saveEdited).toHaveBeenCalledTimes(1);
    expect(tools().drawing).toBeTruthy();
    await act(async () => tools().handleSave('data:b', {}));
    expect(saveEdited).toHaveBeenCalledTimes(2);
    expect(saveEdited.mock.calls[1]![1]).toBe('data:b');
  });

  it('saves unsaved strokes when the tab goes away', async () => {
    const {tools, unmount} = setup();
    await act(() => tools().startDrawing(target));
    const parts = editor();
    tools().attachEditor(parts);
    act(() => tools().scheduleStrokeSave());
    unmount();
    expect(parts.save).toHaveBeenCalledTimes(1);
  });

  it('keeps a copy of the left canvas up until the next tools have painted', async () => {
    const {tools, rerender} = setup();
    await act(() => tools().startDrawing(target));
    const copy = document.createElement('canvas');
    tools().attachEditor({save: jest.fn(), snapshot: () => copy});
    act(() => tools().leaveDrawing(true));
    rerender();
    expect(tools().placeholderPicture).toBe(copy);
    await act(() => tools().startDrawing(target));
    expect(tools().placeholderPicture).toBe(copy);
    act(() => tools().releasePlaceholder());
    expect(tools().placeholderPicture).toBeUndefined();
  });

  it('hands over a copy of the canvas when Done closes the tools, and not when a picture replaces the drawing', async () => {
    const {tools} = setup();
    const copy = document.createElement('canvas');
    await act(() => tools().startDrawing(target));
    tools().attachEditor({save: jest.fn(), snapshot: () => copy});
    await act(async () => tools().finishDrawing());
    expect(tools().drawing).toBeNull();
    expect(tools().closedPicture).toEqual({key: target.key, canvas: copy});
    // Opening the tools again drops the copy.
    await act(() => tools().startDrawing(target));
    expect(tools().closedPicture).toBeNull();
    tools().attachEditor({save: jest.fn(), snapshot: () => copy});
    act(() => tools().abandonDrawing());
    expect(tools().drawing).toBeNull();
    expect(tools().closedPicture).toBeNull();
  });

  it('hands over a copy for a new drawing whose only save is the one Done makes', async () => {
    const {tools} = setup();
    const copy = document.createElement('canvas');
    await act(() => tools().startDrawing({key: null, imageType: 'sprite'}));
    tools().attachEditor({
      save: () => tools().handleSave('data:a', {}),
      snapshot: () => copy,
    });
    act(() => tools().scheduleStrokeSave());
    await act(async () => tools().finishDrawing());
    expect(tools().drawing).toBeNull();
    // The image's key comes from that save.
    expect(tools().closedPicture).toEqual({key: 'k1', canvas: copy});
  });

  it('saves the project when Done has nothing left to save', async () => {
    const {saveProjectNow, tools} = setup();
    await act(() => tools().startDrawing(target));
    tools().attachEditor(editor());
    await act(async () => tools().handleSave('data:a', {}));
    await act(async () => tools().finishDrawing());
    expect(saveProjectNow).toHaveBeenCalledTimes(1);
  });

  it('saves the project and closes on Done when the editor is gone', async () => {
    const {saveProjectNow, tools} = setup();
    await act(() => tools().startDrawing(target));
    act(() => tools().scheduleStrokeSave());
    await act(async () => tools().finishDrawing());
    expect(saveProjectNow).toHaveBeenCalledTimes(1);
    expect(tools().drawing).toBeNull();
  });

  it("leaves another picture alone while one picture's save runs", async () => {
    const {saveEdited, tools} = setup();
    const second = {key: 'k2', imageType: 'sprite' as const};
    let finishSave: (key: string) => void = () => undefined;
    saveEdited.mockImplementationOnce(
      () => new Promise<string>(resolve => (finishSave = resolve))
    );
    await act(() => tools().startDrawing(target));
    tools().attachEditor({
      save: () => tools().handleSave('data:a', {}),
      snapshot: () => null,
    });
    act(() => tools().scheduleStrokeSave());
    act(() => tools().leaveDrawing());
    // The second picture opens and closes untouched while the first's save
    // runs.
    await act(() => tools().startDrawing(second));
    tools().attachEditor({
      save: () => tools().handleSave('data:b', {}),
      snapshot: () => null,
    });
    await act(async () => tools().finishDrawing());
    await act(async () => {
      finishSave('k1');
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(saveEdited.mock.calls.map(call => call[0].key)).toEqual(['k1']);
  });

  describe('saves of several pictures', () => {
    const pictures = {
      one: {key: 'k1', imageType: 'sprite' as const},
      two: {key: 'k2', imageType: 'sprite' as const},
      three: {key: 'k3', imageType: 'sprite' as const},
      set: {key: 'k4', imageType: 'sprite' as const},
    };
    // Each save resolves to its image's key; `hold` keeps the next one
    // running until the test releases it.
    const savesSetup = () => {
      const tools = setup();
      const held: (() => void)[] = [];
      tools.saveEdited.mockImplementation(async target => target.key ?? 'kNew');
      const hold = () =>
        tools.saveEdited.mockImplementationOnce(
          target =>
            new Promise<string>(resolve =>
              held.push(() => resolve(target.key ?? 'kNew'))
            )
        );
      const tick = () => new Promise(resolve => setTimeout(resolve, 0));
      // A set's save calls saveEdited one tick late, after replaceFrame
      // builds its strip, so release waits a tick first.
      const release = async () => {
        await act(async () => {
          await tick();
          held.shift()?.();
          await tick();
        });
      };
      const open = async (target: ImageTarget, pixels: string) => {
        await act(() => tools.tools().startDrawing(target));
        tools.tools().attachEditor({
          save: () => tools.tools().handleSave(pixels, {}),
          snapshot: () => null,
        });
      };
      const pause = (pixels: string) =>
        act(() => tools.tools().handleSave(pixels, {}));
      const saves = () =>
        tools.saveEdited.mock.calls.map(call => [call[0].key, call[1]]);
      return {...tools, hold, release, open, pause, saves};
    };

    it('saves pictures in order, and saves the project after each is left or done', async () => {
      const t = savesSetup();
      await t.open(pictures.one, 'one:last');
      t.hold();
      t.pause('one:a');
      act(() => t.tools().leaveDrawing());
      await t.open(pictures.two, 'two:last');
      t.pause('two:a');
      await act(async () => t.tools().finishDrawing());
      expect(t.saveProjectNow).not.toHaveBeenCalled();
      await t.release();
      expect(t.saves()).toEqual([
        ['k1', 'one:a'],
        ['k2', 'two:a'],
      ]);
      expect(t.saveProjectNow).toHaveBeenCalledTimes(2);
      expect(t.tools().drawing).toBeNull();
    });

    it("saves each picture's strokes when three pictures are drawn in turn", async () => {
      const t = savesSetup();
      await t.open(pictures.one, 'one:last');
      t.hold();
      t.pause('one:a');
      act(() => t.tools().leaveDrawing());
      await t.open(pictures.two, 'two:last');
      act(() => t.tools().scheduleStrokeSave());
      act(() => t.tools().leaveDrawing());
      await t.open(pictures.three, 'three:last');
      t.pause('three:a');
      await t.release();
      expect(t.saves()).toEqual([
        ['k1', 'one:a'],
        ['k2', 'two:last'],
        ['k3', 'three:a'],
      ]);
    });

    it('still saves the next picture after an abandoned one', async () => {
      const t = savesSetup();
      await t.open(pictures.one, 'one:last');
      t.hold();
      t.pause('one:a');
      await act(async () => undefined);
      act(() => t.tools().abandonDrawing());
      await t.open(pictures.two, 'two:last');
      t.pause('two:a');
      await t.release();
      expect(t.saves()).toEqual([
        ['k1', 'one:a'],
        ['k2', 'two:a'],
      ]);
    });

    it("keeps the canvas up when a left picture's save finishes before the next opens", async () => {
      const t = savesSetup();
      await t.open(pictures.one, 'one:last');
      t.hold();
      t.pause('one:a');
      act(() => t.tools().leaveDrawing(true));
      await t.release();
      expect(t.saves()).toEqual([['k1', 'one:a']]);
      expect(t.tools().drawing).not.toBeNull();
    });

    it("gives a new picture's later saves the key its first save made", async () => {
      const t = savesSetup();
      await t.open(pictures.one, 'one:last');
      t.hold();
      t.pause('one:a');
      act(() => t.tools().leaveDrawing());
      await t.open({key: null, imageType: 'sprite'}, 'new:last');
      t.pause('new:a');
      t.pause('new:b');
      await t.release();
      expect(t.saves()).toEqual([
        ['k1', 'one:a'],
        [null, 'new:a'],
        ['kNew', 'new:b'],
      ]);
    });

    it("opens a set's next frame only after its saves finish", async () => {
      const t = savesSetup();
      await act(() => t.tools().startDrawing(pictures.set, 0));
      t.tools().attachEditor({
        save: () => t.tools().handleSave('f0', {}),
        snapshot: () => null,
      });
      t.hold();
      // Frame 0's save is running, with nothing new drawn, when frame 1 is
      // chosen.
      t.pause('f0');
      await act(async () => {
        t.tools().selectFrame(1);
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      expect(t.tools().drawing!.sheet!.index).toBe(0);
      await t.release();
      expect(t.tools().drawing!.sheet!.index).toBe(1);
      t.pause('f1');
      await t.release();
      // The second save builds on the strip the first one left.
      expect(t.saveEdited.mock.calls.map(call => call[1])).toEqual([
        'strip|0=f0',
        'strip|0=f0|1=f1',
      ]);
    });

    it('stays on the frame chosen again while a switch away from it waits', async () => {
      const t = savesSetup();
      await act(() => t.tools().startDrawing(pictures.set, 0));
      t.tools().attachEditor({
        save: () => t.tools().handleSave('f0', {}),
        snapshot: () => null,
      });
      t.hold();
      t.pause('f0');
      await act(async () => {
        t.tools().selectFrame(1);
        t.tools().selectFrame(0);
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      await t.release();
      expect(t.tools().drawing!.sheet!.index).toBe(0);
    });

    it("never takes a left picture's running save for the next picture's", async () => {
      const t = savesSetup();
      await t.open(pictures.one, 'one:last');
      // The first picture's save is held; the next picture opens while it
      // runs.
      t.hold();
      t.pause('one:a');
      act(() => t.tools().leaveDrawing(true));
      await t.release();
      await t.open(pictures.two, 'two:untouched');
      await act(async () => t.tools().finishDrawing());
      await t.release();
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      expect(t.saves().map(save => save[0])).not.toContain('k2');
    });

    it("saves strokes made while Done's save ran before closing", async () => {
      const t = savesSetup();
      let pixels = 'one:done';
      await act(() => t.tools().startDrawing(pictures.one));
      t.tools().attachEditor({
        save: () => t.tools().handleSave(pixels, {}),
        snapshot: () => null,
      });
      t.hold();
      act(() => t.tools().scheduleStrokeSave());
      await act(async () => t.tools().finishDrawing());
      // A stroke while Done's save runs.
      pixels = 'one:after';
      act(() => t.tools().scheduleStrokeSave());
      await t.release();
      expect(t.saves()).toEqual([
        ['k1', 'one:done'],
        ['k1', 'one:after'],
      ]);
      expect(t.tools().drawing).toBeNull();
    });

    it('saves strokes made while a frame switch waits into the frame they were on', async () => {
      const t = savesSetup();
      let pixels = 'f0';
      await act(() => t.tools().startDrawing(pictures.set, 0));
      t.tools().attachEditor({
        save: () => t.tools().handleSave(pixels, {}),
        snapshot: () => null,
      });
      t.hold();
      t.pause('f0');
      await act(async () => {
        t.tools().selectFrame(1);
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      // The frame row still shows frame 0, so the student draws on.
      pixels = 'f0+more';
      act(() => t.tools().scheduleStrokeSave());
      await t.release();
      await t.release();
      expect(t.saveEdited.mock.calls.map(call => call[1])).toEqual([
        'strip|0=f0',
        'strip|0=f0|0=f0+more',
      ]);
      expect(t.tools().drawing!.sheet!.index).toBe(1);
    });
  });
});
