import {act, render} from '@testing-library/react';
import React, {useEffect} from 'react';

import {GeneratedImageResult} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';
import useLearningStory, {
  LearningStoryTools,
} from '@cdo/apps/p5lab/spritelab/lab2/views/images/teaching/useLearningStory';

jest.mock('@cdo/apps/code-studio/utils', () => ({queryParams: () => ''}));

const picture = (
  generation: Partial<GeneratedImageResult['generation']>
): GeneratedImageResult =>
  ({
    filename: 'made.png',
    uint8Array: new Uint8Array([137, 80, 78, 71]),
    mediaType: 'image/png',
    generation: {imageType: 'sprite', prompt: 'A cat', ...generation},
  } as GeneratedImageResult);

/** A story a student asks for from Behind the scenes. */
const asked = {
  picture: {src: 'data:image/png;base64,AA=='},
  prompt: 'A dog',
  imageType: 'sprite' as const,
};

/** Renders the hook and hands back its latest tools. */
function setup(
  options: {active?: boolean; learning?: boolean; levelId?: number} = {}
) {
  const latest: {tools?: LearningStoryTools} = {};
  const Harness = ({
    active = true,
    levelId = options.levelId,
  }: {
    active?: boolean;
    levelId?: number;
  }) => {
    const tools = useLearningStory({
      active,
      learning: options.learning,
      levelId,
    });
    useEffect(() => {
      latest.tools = tools;
    });
    return null;
  };
  const view = render(<Harness active={options.active} />);
  return {
    tools: () => latest.tools!,
    setActive: (active: boolean) => view.rerender(<Harness active={active} />),
    setLevel: (levelId: number) => view.rerender(<Harness levelId={levelId} />),
    unmount: view.unmount,
  };
}

/** Offers a picture that is ready to be shown. */
function offer(tools: () => LearningStoryTools) {
  let shown: Promise<void> = Promise.resolve();
  act(() => {
    shown = tools().offerStory(picture({subject: 'character'}));
  });
  return shown;
}

/** Whether a promise has resolved by now. */
async function settled(promise: Promise<void>) {
  let done = false;
  promise.then(() => (done = true));
  await act(async () => {});
  return done;
}

describe('useLearningStory', () => {
  it('tells the story at once, and holds the picture until it is closed', async () => {
    const {tools} = setup({learning: true});
    const shown = offer(tools);
    expect(tools().story).toMatchObject({prompt: 'A cat'});
    expect(await settled(shown)).toBe(false);
    act(() => tools().endStory());
    expect(tools().story).toBeNull();
    expect(await settled(shown)).toBe(true);
  });

  it('holds the story while the rating question is open, and tells it after', () => {
    const {tools} = setup({learning: true});
    act(() => tools().handleAsking(true));
    offer(tools);
    expect(tools().story).toBeNull();
    act(() => tools().handleAsking(false));
    expect(tools().story).toMatchObject({prompt: 'A cat'});
    act(() => tools().endStory());
    expect(tools().story).toBeNull();
  });

  it('tells no story on a level that does not ask for one, and shows the picture at once', async () => {
    const {tools} = setup({levelId: 3});
    const shown = offer(tools);
    expect(tools().story).toBeNull();
    expect(await settled(shown)).toBe(true);
  });

  it('tells the story once a visit, and again on the next level or a return', () => {
    const {tools, setLevel} = setup({learning: true, levelId: 3});
    offer(tools);
    expect(tools().story).toMatchObject({prompt: 'A cat'});
    act(() => tools().endStory());
    offer(tools);
    expect(tools().story).toBeNull();
    // The tab stays mounted across Continue; the next level is a new visit.
    setLevel(8);
    offer(tools);
    expect(tools().story).toMatchObject({prompt: 'A cat'});
    act(() => tools().endStory());
    // So is coming back.
    setLevel(3);
    offer(tools);
    expect(tools().story).toMatchObject({prompt: 'A cat'});
  });

  it('drops a story still held when the level changes, and lets its picture go', async () => {
    const {tools, setActive, setLevel} = setup({learning: true, levelId: 3});
    // Held: the tab is not the one showing.
    setActive(false);
    const shown = offer(tools);
    expect(tools().story).toBeNull();
    setLevel(8);
    expect(tools().story).toBeNull();
    expect(await settled(shown)).toBe(true);
    // The new level still gets its own telling.
    offer(tools);
    expect(tools().story).toMatchObject({prompt: 'A cat'});
  });

  it('tells a story the student asks for at once, on any level', () => {
    const {tools} = setup({levelId: 3});
    act(() => tools().tellStory(asked));
    expect(tools().story).toEqual({...asked, asked: true});
    act(() => tools().endStory());
    expect(tools().story).toBeNull();
  });

  it("counts an asked-for story as the visit's telling", async () => {
    const {tools} = setup({learning: true, levelId: 3});
    // Asked for while the due story is held: the due story neither takes
    // over nor follows, and its picture is shown.
    act(() => tools().handleAsking(true));
    const shown = offer(tools);
    act(() => tools().tellStory(asked));
    act(() => tools().handleAsking(false));
    expect(tools().story).toEqual({...asked, asked: true});
    expect(await settled(shown)).toBe(true);
    act(() => tools().endStory());
    offer(tools);
    expect(tools().story).toBeNull();
  });

  it('lets a held picture go when the tab goes away for good', async () => {
    const {tools, setActive, unmount} = setup({learning: true});
    setActive(false);
    const shown = offer(tools);
    unmount();
    expect(await settled(shown)).toBe(true);
  });
});
