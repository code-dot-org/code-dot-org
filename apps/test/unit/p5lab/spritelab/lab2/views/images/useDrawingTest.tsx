import {act, render} from '@testing-library/react';
import React, {useEffect} from 'react';

import {ProjectImage} from '@cdo/apps/p5lab/spritelab/lab2/views/images/projectImages';
import useDrawing, {
  UPLOAD_GAP_MS,
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
    act(() => tools().leaveDrawing(true));
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

  it('saves unsaved strokes when the tab goes away', async () => {
    const {tools, unmount} = setup();
    await act(() => tools().startDrawing(target));
    const parts = editor();
    tools().attachEditor(parts);
    act(() => tools().scheduleStrokeSave());
    unmount();
    expect(parts.save).toHaveBeenCalledTimes(1);
  });

  it("drops an abandoned drawing's save, which is no longer wanted", async () => {
    const {saveEdited, tools} = setup();
    await act(() => tools().startDrawing(target));
    tools().attachEditor(editor());
    let finish: (key: string) => void = () => undefined;
    saveEdited.mockImplementationOnce(
      () => new Promise<string>(resolve => (finish = resolve))
    );
    act(() => tools().handleSave('data:a', {}));
    const options = saveEdited.mock.calls[0]![3]!;
    expect(options.stillWanted?.()).toBe(true);
    act(() => tools().abandonDrawing());
    expect(tools().drawing).toBeNull();
    expect(options.stillWanted?.()).toBe(false);
    await act(async () => finish('k1'));
    expect(tools().drawing).toBeNull();
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

  it("asks for a project save only on the drawing's last save", async () => {
    const {storePicture, tools} = setup();
    await act(() => tools().startDrawing(target));
    tools().attachEditor({
      save: () => tools().handleSave('data:b', {}),
      snapshot: () => null,
    });
    await act(async () => tools().handleSave('data:a', {}));
    act(() => tools().scheduleStrokeSave());
    await act(async () => tools().finishDrawing());
    expect(storePicture.mock.calls.map(call => call[2])).toEqual([false, true]);
  });

  it('saves the project when Done has nothing left to save', async () => {
    const {saveProjectNow, tools} = setup();
    await act(() => tools().startDrawing(target));
    tools().attachEditor(editor());
    await act(async () => tools().handleSave('data:a', {}));
    await act(async () => tools().finishDrawing());
    expect(saveProjectNow).toHaveBeenCalledTimes(1);
  });

  it('uploads and saves the project when left during a pause save that does not upload', async () => {
    const {saveEdited, storePicture, saveProjectNow, tools} = setup();
    await act(() => tools().startDrawing(target));
    tools().attachEditor({
      save: () => tools().handleSave('data:last', {}),
      snapshot: () => null,
    });
    // The first pause uploads; the second, within the gap, does not.
    await act(async () => tools().handleSave('data:a', {}));
    let finishSave: (key: string) => void = () => undefined;
    saveEdited.mockImplementationOnce(
      () => new Promise<string>(resolve => (finishSave = resolve))
    );
    act(() => tools().handleSave('data:b', {}));
    act(() => tools().leaveDrawing());
    await act(async () => {
      finishSave('k1');
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    const uploads = saveEdited.mock.calls.map(call => call[3]!.upload);
    expect(uploads).toEqual([true, false, true]);
    // The last save asks storePicture for the project save itself.
    expect(storePicture.mock.calls.map(call => call[2])).toEqual([
      false,
      false,
      true,
    ]);
    expect(saveProjectNow).not.toHaveBeenCalled();
  });

  it('uploads when the level is left during a pause save that does not upload', async () => {
    const {saveEdited, tools, unmount} = setup();
    await act(() => tools().startDrawing(target));
    tools().attachEditor({
      save: () => tools().handleSave('data:last', {}),
      snapshot: () => null,
    });
    await act(async () => tools().handleSave('data:a', {}));
    let finishSave: (key: string) => void = () => undefined;
    saveEdited.mockImplementationOnce(
      () => new Promise<string>(resolve => (finishSave = resolve))
    );
    act(() => tools().handleSave('data:b', {}));
    unmount();
    await act(async () => {
      finishSave('k1');
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    const uploads = saveEdited.mock.calls.map(call => call[3]!.upload);
    expect(uploads).toEqual([true, false, true]);
  });

  it('saves the project and closes on Done when the editor is gone', async () => {
    const {saveProjectNow, tools} = setup();
    await act(() => tools().startDrawing(target));
    act(() => tools().scheduleStrokeSave());
    await act(async () => tools().finishDrawing());
    expect(saveProjectNow).toHaveBeenCalledTimes(1);
    expect(tools().drawing).toBeNull();
  });

  it("leaves another picture alone while one picture's last save uploads", async () => {
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
    // The second picture opens and closes untouched while the first uploads.
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

  it("keeps a picture's waiting last save when another picture saves", async () => {
    const {saveEdited, tools} = setup();
    const second = {key: 'k2', imageType: 'sprite' as const};
    let finishSave: (key: string) => void = () => undefined;
    saveEdited.mockImplementationOnce(
      () => new Promise<string>(resolve => (finishSave = resolve))
    );
    await act(() => tools().startDrawing(target));
    tools().attachEditor({
      save: () => tools().handleSave('data:last', {}),
      snapshot: () => null,
    });
    act(() => tools().handleSave('data:a', {}));
    act(() => tools().leaveDrawing());
    await act(() => tools().startDrawing(second));
    tools().attachEditor(editor());
    act(() => tools().handleSave('data:b', {}));
    await act(async () => {
      finishSave('k1');
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    const calls = saveEdited.mock.calls.map(call => [
      call[0].key,
      call[1],
      call[3]!.upload,
    ]);
    expect(calls).toEqual([
      ['k1', 'data:a', true],
      ['k1', 'data:last', true],
      // Within the upload gap; its file goes up on its own last save.
      ['k2', 'data:b', false],
    ]);
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
    const queueSetup = () => {
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
      // A set's save reaches saveEdited a tick late, after its strip.
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
        tools.saveEdited.mock.calls.map(call => [
          call[0].key,
          call[1],
          call[3]!.upload,
        ]);
      const saveNows = () =>
        tools.storePicture.mock.calls.map(call => [
          (call[0] as ImageTarget).key,
          call[2],
        ]);
      return {...tools, hold, release, open, pause, saves, saveNows};
    };

    it("finishes the open picture's waiting save on Done, as its last save", async () => {
      const t = queueSetup();
      await t.open(pictures.one, 'one:last');
      t.hold();
      t.pause('one:a');
      act(() => t.tools().leaveDrawing());
      await t.open(pictures.two, 'two:last');
      t.pause('two:a');
      await act(async () => t.tools().finishDrawing());
      await t.release();
      await t.release();
      expect(t.saves()).toEqual([
        ['k1', 'one:a', true],
        ['k1', 'one:last', true],
        ['k2', 'two:last', true],
      ]);
      expect(t.saveNows()).toEqual([
        ['k1', false],
        ['k1', true],
        ['k2', true],
      ]);
      expect(t.tools().drawing).toBeNull();
    });

    it("keeps another picture's waiting last save when the open one closes untouched", async () => {
      const t = queueSetup();
      await t.open(pictures.one, 'one:last');
      t.hold();
      t.pause('one:a');
      act(() => t.tools().leaveDrawing());
      await t.open(pictures.two, 'two:last');
      await act(async () => t.tools().finishDrawing());
      await t.release();
      expect(t.saves()).toEqual([
        ['k1', 'one:a', true],
        ['k1', 'one:last', true],
      ]);
    });

    it('makes a waiting save of a picture left untouched its last save', async () => {
      const t = queueSetup();
      await t.open(pictures.one, 'one:last');
      t.hold();
      t.pause('one:a');
      act(() => t.tools().leaveDrawing());
      await t.open(pictures.two, 'two:last');
      t.pause('two:a');
      act(() => t.tools().leaveDrawing());
      await t.release();
      expect(t.saves()).toEqual([
        ['k1', 'one:a', true],
        ['k1', 'one:last', true],
        ['k2', 'two:last', true],
      ]);
    });

    it("keeps every picture's last save when three pictures save in turn", async () => {
      const t = queueSetup();
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
      expect(t.saves().map(save => save.slice(0, 2))).toEqual([
        ['k1', 'one:a'],
        ['k1', 'one:last'],
        ['k2', 'two:last'],
        ['k3', 'three:a'],
      ]);
    });

    it('runs the waiting saves after an abandoned save', async () => {
      const t = queueSetup();
      await t.open(pictures.one, 'one:last');
      t.hold();
      t.pause('one:a');
      act(() => t.tools().abandonDrawing());
      await t.open(pictures.two, 'two:last');
      t.pause('two:a');
      await t.release();
      expect(t.saves().map(save => save.slice(0, 2))).toEqual([
        ['k1', 'one:a'],
        ['k2', 'two:a'],
      ]);
    });

    it("opens a set's next frame only after its saves finish", async () => {
      const t = queueSetup();
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

    it("runs a left picture's last save when its running save fails before the next picture opens", async () => {
      const t = queueSetup();
      await t.open(pictures.one, 'one:last');
      t.saveEdited.mockImplementationOnce(() =>
        Promise.reject(new Error('network'))
      );
      t.hold();
      t.pause('one:a');
      // Choosing another picture keeps the canvas up until it opens.
      act(() => t.tools().leaveDrawing(true));
      await t.release();
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      expect(t.saves().map(save => save.slice(0, 2))).toEqual([
        ['k1', 'one:a'],
        ['k1', 'one:last'],
      ]);
      expect(t.tools().saveFailed).toBe(false);
    });

    it("never takes a left picture's unuploaded save for the next picture's", async () => {
      const t = queueSetup();
      await t.open(pictures.one, 'one:last');
      t.pause('one:first');
      await t.release();
      // Within the upload gap: this pause stores pixels without uploading.
      // Its last save is still running when the next picture opens.
      t.hold();
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

    it("keeps the canvas up when a left picture's last save finishes before the next opens", async () => {
      const t = queueSetup();
      await t.open(pictures.one, 'one:last');
      t.hold();
      t.pause('one:a');
      act(() => t.tools().leaveDrawing(true));
      await t.release();
      expect(t.saves().map(save => save.slice(0, 2))).toEqual([
        ['k1', 'one:a'],
        ['k1', 'one:last'],
      ]);
      // The last save leaves the next picture's opening alone.
      expect(t.tools().drawing).not.toBeNull();
    });

    it("gives a new picture's later saves the key its first save made", async () => {
      const t = queueSetup();
      await t.open(pictures.one, 'one:last');
      t.hold();
      t.pause('one:a');
      act(() => t.tools().leaveDrawing());
      await t.open({key: null, imageType: 'sprite'}, 'new:last');
      t.pause('new:a');
      t.pause('new:b');
      await t.release();
      expect(t.saves().map(save => save.slice(0, 2))).toEqual([
        ['k1', 'one:a'],
        ['k1', 'one:last'],
        [null, 'new:b'],
      ]);
      t.pause('new:c');
      await t.release();
      expect(t.saves()[3].slice(0, 2)).toEqual(['kNew', 'new:c']);
    });
  });

  it('uploads the file at most once per gap, and on the last save', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(100000);
    const {saveEdited, tools} = setup();
    await act(() => tools().startDrawing(target));
    tools().attachEditor(editor());
    const uploads = () => saveEdited.mock.calls.map(call => call[3]!.upload);
    await act(async () => tools().handleSave('data:a', {}));
    await act(async () => tools().handleSave('data:b', {}));
    expect(uploads()).toEqual([true, false]);
    jest.setSystemTime(100000 + UPLOAD_GAP_MS - 1);
    await act(async () => tools().handleSave('data:b2', {}));
    expect(uploads()).toEqual([true, false, false]);
    jest.setSystemTime(100000 + UPLOAD_GAP_MS);
    await act(async () => tools().handleSave('data:c', {}));
    expect(uploads()).toEqual([true, false, false, true]);
    await act(async () => tools().finishDrawing());
    expect(tools().drawing).toBeNull();
  });
});
