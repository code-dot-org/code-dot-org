import {render} from '@testing-library/react';
import React from 'react';

import {RuntimeAnimationList} from '@cdo/apps/p5lab/spritelab/lab2/types';
import useReportImageLoadFailures from '@cdo/apps/p5lab/spritelab/lab2/views/useReportImageLoadFailures';

const sendEvent = jest.fn();
jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: (...args: unknown[]) => sendEvent(...args)},
}));

const list = (propsByKey: Record<string, Record<string, unknown>>) =>
  ({
    orderedKeys: Object.keys(propsByKey),
    propsByKey,
  } as unknown as RuntimeAnimationList);

function Probe({animationList}: {animationList: RuntimeAnimationList}) {
  useReportImageLoadFailures(animationList);
  return null;
}

describe('useReportImageLoadFailures', () => {
  beforeEach(() => sendEvent.mockClear());

  it('reports an image whose file failed to load, with where the file lives', () => {
    render(
      <Probe
        animationList={list({
          k1: {
            sourceUrl: '/v3/assets/chan/bg.png',
            role: 'platform-background',
            loadFailure: {reason: 'httpError', status: 404},
          },
          k2: {sourceUrl: '/v3/assets/chan/ok.png', loadedFromSource: true},
        })}
      />
    );
    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledWith(
      'hoai2026-image-load-failed',
      {
        reason: 'httpError',
        status: 404,
        file: 'project',
        role: 'platform-background',
      },
      true
    );
  });

  it('reports each failed image once, and again only under a new link', () => {
    const failed = (sourceUrl: string) =>
      list({k1: {sourceUrl, loadFailure: {reason: 'notImage'}}});
    const {rerender} = render(
      <Probe animationList={failed('/v3/assets/chan/a.png')} />
    );
    rerender(<Probe animationList={failed('/v3/assets/chan/a.png')} />);
    expect(sendEvent).toHaveBeenCalledTimes(1);
    rerender(<Probe animationList={failed('/v3/assets/chan/b.png')} />);
    expect(sendEvent).toHaveBeenCalledTimes(2);
    expect(sendEvent.mock.calls[1][1]).toEqual({
      reason: 'notImage',
      file: 'project',
    });
  });
});
