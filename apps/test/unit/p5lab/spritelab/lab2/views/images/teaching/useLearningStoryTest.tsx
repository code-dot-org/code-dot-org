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

/** Offers a picture and lets the reveal pause pass. */
function offer(tools: () => LearningStoryTools) {
  act(() => tools().offerStory(picture({subject: 'character'})));
  act(() => {
    jest.advanceTimersByTime(2000);
  });
}

describe('useLearningStory', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('holds the story while the rating question is open, and tells it after', () => {
    const {tools} = setup({learning: true});
    act(() => tools().handleAsking(true));
    act(() => tools().offerStory(picture({subject: 'character'})));
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(tools().story).toBeNull();
    act(() => tools().handleAsking(false));
    expect(tools().story).toMatchObject({prompt: 'A cat'});
    act(() => tools().endStory());
    expect(tools().story).toBeNull();
  });

  it('tells no story on a level that does not ask for one', () => {
    const {tools} = setup({levelId: 3});
    offer(tools);
    expect(tools().story).toBeNull();
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

  it('drops a story still pending when the level changes', () => {
    const {tools, setLevel} = setup({learning: true, levelId: 3});
    act(() => tools().offerStory(picture({subject: 'character'})));
    setLevel(8);
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(tools().story).toBeNull();
    // The new level still gets its own telling.
    offer(tools);
    expect(tools().story).toMatchObject({prompt: 'A cat'});
  });

  it('forgets a pending story when it goes away', () => {
    const {tools, unmount} = setup({learning: true});
    act(() => tools().offerStory(picture({subject: 'character'})));
    unmount();
    expect(() => jest.advanceTimersByTime(2000)).not.toThrow();
    expect(jest.getTimerCount()).toBe(0);
  });
});
