import {render} from '@testing-library/react';
import React from 'react';

import type {ImageProps} from '@cdo/apps/p5lab/spritelab/lab2/views/images/projectImages';
import useReleaseRemovedImages from '@cdo/apps/p5lab/spritelab/lab2/views/useReleaseRemovedImages';

const reclaim = jest.fn();
jest.mock('@cdo/apps/p5lab/spritelab/lab2/views/useReclaimAsset', () => ({
  __esModule: true,
  default: () => (url?: string) => reclaim(url),
}));
const unflag = jest.fn((...args: unknown[]) => Promise.resolve());
jest.mock('@cdo/apps/lab2/redux/lab2ProjectReduxThunks', () => ({
  unflagProjectChannel: (...args: unknown[]) => unflag(...args),
}));
let labState: Record<string, unknown> = {
  channel: {id: 'chan'},
  isBlockedAbuse: true,
};
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (select: (state: unknown) => unknown) =>
    select({lab: labState}),
}));

function releaser() {
  let release: (removed: (ImageProps | undefined)[]) => void = () => undefined;
  const Probe = () => {
    release = useReleaseRemovedImages();
    return null;
  };
  render(<Probe />);
  return release;
}

const image = (props: Partial<ImageProps>) => props as ImageProps;

describe('useReleaseRemovedImages', () => {
  beforeEach(() => {
    reclaim.mockClear();
    unflag.mockClear();
    labState = {channel: {id: 'chan'}, isBlockedAbuse: true};
  });

  it('reclaims every removed image, flagged or not', () => {
    releaser()([
      image({sourceUrl: 'a.png'}),
      image({sourceUrl: 'b.png', flagged: true}),
      undefined,
    ]);
    expect(reclaim.mock.calls.map(call => call[0])).toEqual([
      'a.png',
      'b.png',
      undefined,
    ]);
  });

  it('asks to unblock once for each flagged image removed', async () => {
    releaser()([
      image({sourceUrl: 'a.png'}),
      image({sourceUrl: 'b.png', flagged: true}),
      image({sourceUrl: 'c.png', flagged: true}),
    ]);
    await Promise.resolve();
    expect(unflag).toHaveBeenCalledTimes(2);
    expect(unflag).toHaveBeenCalledWith('chan', expect.anything());
  });

  it('asks for nothing when no flagged image went', () => {
    releaser()([image({sourceUrl: 'a.png'})]);
    expect(unflag).not.toHaveBeenCalled();
  });

  it('asks for nothing when the project is not blocked', () => {
    labState = {channel: {id: 'chan'}};
    releaser()([image({sourceUrl: 'a.png', flagged: true})]);
    expect(unflag).not.toHaveBeenCalled();
  });

  it('asks for nothing without a project to unblock', () => {
    labState = {isBlockedAbuse: true};
    releaser()([image({sourceUrl: 'a.png', flagged: true})]);
    expect(unflag).not.toHaveBeenCalled();
  });
});
