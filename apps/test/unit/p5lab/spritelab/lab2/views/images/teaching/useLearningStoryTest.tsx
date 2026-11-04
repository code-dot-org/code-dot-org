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
function setup(options: {active?: boolean; lockedImageType?: 'sprite'} = {}) {
  const latest: {tools?: LearningStoryTools} = {};
  const Harness = ({active = true}: {active?: boolean}) => {
    const tools = useLearningStory({
      active,
      lockedImageType: options.lockedImageType,
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
    unmount: view.unmount,
  };
}

describe('useLearningStory', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('holds the story while the rating question is open, and tells it after', () => {
    const {tools} = setup({lockedImageType: 'sprite'});
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

  it('tells no story off a level about one image, for an object, or for a block', () => {
    const cases: [ReturnType<typeof setup>, GeneratedImageResult][] = [
      [setup(), picture({subject: 'character'})],
      [setup({lockedImageType: 'sprite'}), picture({subject: 'object'})],
      [setup({lockedImageType: 'sprite'}), picture({imageType: 'block'})],
    ];
    cases.forEach(([{tools}, result]) => {
      act(() => tools().offerStory(result));
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      expect(tools().story).toBeNull();
    });
  });

  it('forgets a pending story when it goes away', () => {
    const {tools, unmount} = setup({lockedImageType: 'sprite'});
    act(() => tools().offerStory(picture({subject: 'character'})));
    unmount();
    expect(() => jest.advanceTimersByTime(2000)).not.toThrow();
    expect(jest.getTimerCount()).toBe(0);
  });
});
