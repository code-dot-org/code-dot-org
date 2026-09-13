// Decoding the project's pictures, and not losing one on the way.
//
// The hook is two lines of bookkeeping around `new Image()`, and both were
// wrong in the same direction: a decode is slower than the project, so what is
// worth pinning is what happens when the project moves first.

import {act, renderHook} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {useProjectImages} from '../useProjectImages';

/** Every `Image` the hook made, in the order it made them. */
const made: Array<{src: string; onload: (() => void) | null}> = [];

class Decoding {
  onload: (() => void) | null = null;
  src = '';
  naturalWidth = 32;
  naturalHeight = 32;

  constructor() {
    made.push(this);
  }
}

/** A project holding pictures on URLs, plus a file to vary. */
const project = (
  pictures: Record<string, string>,
  note = '',
): MultiFileSource =>
  ({
    folders: {},
    files: {
      ...Object.fromEntries(
        Object.entries(pictures).map(([name, url]) => [
          name,
          {id: name, name, language: 'png', contents: '', url, folderId: 'f1'},
        ]),
      ),
      // Something that is not a picture, so a change to the project is not a
      // change to the pictures — which is the case that broke.
      'world.world': {
        id: 'w',
        name: 'world.world',
        language: 'world',
        contents: note,
        folderId: 'f1',
      },
    },
    openFiles: [],
  }) as unknown as MultiFileSource;

beforeEach(() => {
  made.length = 0;
  vi.stubGlobal('Image', Decoding);
});

describe('useProjectImages', () => {
  it('hands back a picture once it has decoded', () => {
    const {result} = renderHook(() =>
      useProjectImages(project({'crab.png': '/v3/assets/c/1.png'})),
    );

    expect(result.current['crab.png']).toBeUndefined();
    act(() => made[0].onload?.());
    expect(result.current['crab.png']).toBeTruthy();
  });

  it('keeps a decode that lands after the project has moved on', () => {
    // THE RACE A LEARNER MEETS BY MAKING A PICTURE. Writing one changes the
    // project, and so does everything the write sets off; a decode still in
    // flight when that happens used to be thrown away by its own `onload`,
    // and never asked for again.
    const {result, rerender} = renderHook(
      ({source}) => useProjectImages(source),
      {initialProps: {source: project({'crab.png': '/v3/assets/c/1.png'})}},
    );
    expect(made).toHaveLength(1);

    // The project changes while the picture is still decoding.
    rerender({
      source: project({'crab.png': '/v3/assets/c/1.png'}, 'edited'),
    });
    // …and it is not asked for a second time, so this result is the only one
    // there will ever be.
    expect(made).toHaveLength(1);

    act(() => made[0].onload?.());
    expect(result.current['crab.png']).toBeTruthy();
  });

  it('asks once per picture, however often the project changes', () => {
    const source = project({'crab.png': '/v3/assets/c/1.png'});
    const {rerender} = renderHook(({source}) => useProjectImages(source), {
      initialProps: {source},
    });

    rerender({source: project({'crab.png': '/v3/assets/c/1.png'}, 'a')});
    rerender({source: project({'crab.png': '/v3/assets/c/1.png'}, 'b')});

    expect(made).toHaveLength(1);
  });

  it('asks again when the same name is a different picture', () => {
    const {rerender} = renderHook(({source}) => useProjectImages(source), {
      initialProps: {source: project({'crab.png': '/v3/assets/c/1.png'})},
    });

    rerender({source: project({'crab.png': '/v3/assets/c/2.png'})});

    expect(made).toHaveLength(2);
    expect(made[1].src).toBe('/v3/assets/c/2.png');
  });

  it('picks up a picture the project did not have before', () => {
    const {result, rerender} = renderHook(
      ({source}) => useProjectImages(source),
      {initialProps: {source: project({'crab.png': '/v3/assets/c/1.png'})}},
    );

    rerender({
      source: project({
        'crab.png': '/v3/assets/c/1.png',
        'star.png': '/v3/assets/c/2.png',
      }),
    });

    expect(made).toHaveLength(2);
    act(() => made[1].onload?.());
    expect(result.current['star.png']).toBeTruthy();
  });
});
