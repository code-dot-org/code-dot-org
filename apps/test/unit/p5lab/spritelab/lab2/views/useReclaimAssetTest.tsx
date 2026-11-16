import {render} from '@testing-library/react';
import React from 'react';

import useReclaimAsset from '@cdo/apps/p5lab/spritelab/lab2/views/useReclaimAsset';

jest.mock('@cdo/apps/redux', () => {
  const propsByKey: Record<string, Record<string, unknown>> = {};
  const store = {
    getState: () => ({
      animationList: {orderedKeys: Object.keys(propsByKey), propsByKey},
    }),
    dispatch: () => undefined,
  };
  return {
    getStore: () => store,
    registerReducers: () => undefined,
    mockPropsByKey: propsByKey,
  };
});
const propsByKey = (
  jest.requireMock('@cdo/apps/redux') as {
    mockPropsByKey: Record<string, Record<string, unknown>>;
  }
).mockPropsByKey;
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: (select: (state: unknown) => unknown) =>
    select({lab: {channel: {id: 'chan'}}}),
}));
const httpDelete = jest.fn((...args: unknown[]) => Promise.resolve());
jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {delete: (...args: unknown[]) => httpDelete(...args)},
}));

function reclaimer() {
  let reclaim: (url?: string) => void = () => undefined;
  const Probe = () => {
    reclaim = useReclaimAsset();
    return null;
  };
  render(<Probe />);
  return (url?: string) => reclaim(url);
}

describe('useReclaimAsset', () => {
  beforeEach(() => {
    Object.keys(propsByKey).forEach(key => delete propsByKey[key]);
    httpDelete.mockClear();
  });

  it("deletes one of this project's uploads that no image points at", () => {
    propsByKey.k1 = {sourceUrl: '/v3/assets/chan/kept.png'};
    reclaimer()('/v3/assets/chan/old.png');
    expect(httpDelete).toHaveBeenCalledWith('/v3/assets/chan/old.png', true);
  });

  it('leaves a file an image still points at, and files of other projects', () => {
    propsByKey.k1 = {sourceUrl: '/v3/assets/chan/used.png'};
    const reclaim = reclaimer();
    reclaim('/v3/assets/chan/used.png');
    reclaim('/v3/assets/other/old.png');
    reclaim('data:image/png;base64,AAAA');
    reclaim(undefined);
    expect(httpDelete).not.toHaveBeenCalled();
  });
});
