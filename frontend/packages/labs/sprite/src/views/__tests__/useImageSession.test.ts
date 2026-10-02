import {act, renderHook} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {
  type Alternative,
  alternativeFromAnimation,
  framesFromAnimation,
  useImageSession,
} from '../useImageSession';

const alt = (id: string): Alternative => ({
  id,
  thumb: `${id}.png`,
  sourceUrl: `/v3/assets/channel/${id}.png`,
  frameSize: null,
});

function setup() {
  const reclaim = vi.fn();
  const view = renderHook(() => useImageSession(reclaim));
  return {reclaim, view};
}

describe('framesFromAnimation', () => {
  it('is undefined for a single-frame picture', () => {
    expect(framesFromAnimation({})).toBeUndefined();
    expect(
      framesFromAnimation({frameSize: {x: 8, y: 8}, frameCount: 1}),
    ).toBeUndefined();
  });

  it('fills playback defaults for a strip', () => {
    expect(
      framesFromAnimation({frameSize: {x: 8, y: 8}, frameCount: 4}),
    ).toEqual({
      frameSize: {x: 8, y: 8},
      frameCount: 4,
      frameDelay: 2,
      looping: true,
      poses: undefined,
    });
  });
});

describe('alternativeFromAnimation', () => {
  it('is null without an image', () => {
    expect(alternativeFromAnimation()).toBeNull();
    expect(alternativeFromAnimation({frameCount: 1})).toBeNull();
  });

  it('prefers the data URI for the thumb and keeps the source URL', () => {
    const entry = alternativeFromAnimation({
      dataURI: 'data:image/png;base64,AA',
      sourceUrl: '/v3/assets/channel/a.png',
      pixelGridSize: 4,
    });
    expect(entry).toMatchObject({
      thumb: 'data:image/png;base64,AA',
      sourceUrl: '/v3/assets/channel/a.png',
      frameSize: null,
      pixelGridSize: 4,
    });
    expect(entry?.id).toEqual(expect.any(String));
  });

  it('falls back to the thumb for the source URL', () => {
    expect(alternativeFromAnimation({dataURI: 'data:x'})?.sourceUrl).toBe(
      'data:x',
    );
  });
});

describe('useImageSession', () => {
  it('ages out the oldest entries past five', () => {
    const {view} = setup();
    act(() => {
      ['a', 'b', 'c', 'd', 'e', 'f', 'g'].forEach(id =>
        view.result.current.push(alt(id)),
      );
    });
    expect(view.result.current.alternatives.map(a => a.id)).toEqual([
      'c',
      'd',
      'e',
      'f',
      'g',
    ]);
  });

  it('never ages out the seed', () => {
    const {view} = setup();
    act(() => view.result.current.reset(alt('seed')));
    act(() => {
      ['a', 'b', 'c', 'd', 'e', 'f'].forEach(id =>
        view.result.current.push(alt(id)),
      );
    });
    expect(view.result.current.alternatives.map(a => a.id)).toEqual([
      'seed',
      'c',
      'd',
      'e',
      'f',
    ]);
    expect(view.result.current.seedSourceUrl).toBe(
      '/v3/assets/channel/seed.png',
    );
  });

  it('swaps one entry thumb', () => {
    const {view} = setup();
    act(() => {
      view.result.current.push(alt('a'));
      view.result.current.push(alt('b'));
    });
    act(() => view.result.current.setThumb('b', 'crop.png'));
    expect(view.result.current.alternatives.map(a => a.thumb)).toEqual([
      'a.png',
      'crop.png',
    ]);
  });

  it('reclaims noted assets once, when the session ends', () => {
    const {reclaim, view} = setup();
    act(() => {
      view.result.current.noteAsset('/v3/assets/channel/a.png');
      view.result.current.noteAsset('/v3/assets/channel/a.png');
      view.result.current.noteAsset(undefined);
      view.result.current.noteAsset('/v3/assets/channel/b.png');
    });
    expect(reclaim).not.toHaveBeenCalled();
    act(() => view.result.current.end());
    expect(reclaim.mock.calls).toEqual([
      ['/v3/assets/channel/a.png'],
      ['/v3/assets/channel/b.png'],
    ]);
    expect(view.result.current.alternatives).toEqual([]);
    expect(view.result.current.seedSourceUrl).toBeUndefined();
    act(() => view.result.current.end());
    expect(reclaim).toHaveBeenCalledTimes(2);
  });

  it('sweeps what the last session noted before starting the next', () => {
    const {reclaim, view} = setup();
    act(() => view.result.current.noteAsset('/v3/assets/channel/a.png'));
    act(() => view.result.current.reset(alt('seed')));
    expect(reclaim).toHaveBeenCalledWith('/v3/assets/channel/a.png');
    expect(view.result.current.alternatives.map(a => a.id)).toEqual(['seed']);
  });
});
