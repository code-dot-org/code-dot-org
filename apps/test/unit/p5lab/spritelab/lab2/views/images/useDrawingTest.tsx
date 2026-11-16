import {act, render} from '@testing-library/react';
import React, {useEffect} from 'react';

import {ProjectImage} from '@cdo/apps/p5lab/spritelab/lab2/views/images/projectImages';
import useDrawing, {
  DrawingTools,
} from '@cdo/apps/p5lab/spritelab/lab2/views/images/useDrawing';
import {ImageWriter} from '@cdo/apps/p5lab/spritelab/lab2/views/images/useImageWriter';

// The picture decodes at once.
jest.mock('@cdo/apps/imageUtils', () => ({
  toImage: async () => ({decode: async () => undefined}),
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
];
const target = {key: 'k1', imageType: 'sprite' as const};

/** Renders the hook and hands back its latest tools. */
function setup() {
  const saveEdited = jest.fn() as jest.MockedFunction<
    ImageWriter['saveEdited']
  >;
  saveEdited.mockResolvedValue('k1');
  const storePicture = jest.fn(
    async (_target: unknown, write: () => Promise<string>) => write()
  );
  const latest: {tools?: DrawingTools} = {};
  const Harness = () => {
    const tools = useDrawing({
      images,
      saveEdited,
      storePicture,
      active: true,
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
  return {saveEdited, storePicture, tools, rerender, unmount: view.unmount};
}

const editor = () => ({save: jest.fn(), snapshot: jest.fn(() => null)});

describe('useDrawing', () => {
  afterEach(() => {
    jest.useRealTimers();
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

  it('uploads the file at most every few seconds, and on the last save', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(100000);
    const {saveEdited, tools} = setup();
    await act(() => tools().startDrawing(target));
    tools().attachEditor(editor());
    const uploads = () => saveEdited.mock.calls.map(call => call[3]!.upload);
    await act(async () => tools().handleSave('data:a', {}));
    await act(async () => tools().handleSave('data:b', {}));
    expect(uploads()).toEqual([true, false]);
    jest.setSystemTime(100000 + 5000);
    await act(async () => tools().handleSave('data:c', {}));
    expect(uploads()).toEqual([true, false, true]);
    await act(async () => tools().finishDrawing());
    expect(tools().drawing).toBeNull();
  });
});
