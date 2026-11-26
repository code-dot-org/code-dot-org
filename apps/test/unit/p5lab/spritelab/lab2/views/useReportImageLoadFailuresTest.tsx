import {render} from '@testing-library/react';
import React from 'react';

import {LevelProperties} from '@cdo/apps/lab2/types';
import {RuntimeAnimationList} from '@cdo/apps/p5lab/spritelab/lab2/types';
import useReportImageLoadFailures from '@cdo/apps/p5lab/spritelab/lab2/views/useReportImageLoadFailures';

const sendEvent = jest.fn();
jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: (...args: unknown[]) => sendEvent(...args)},
}));
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: (select: (state: unknown) => unknown) =>
    select({progress: {scriptName: 'quest-builder-2026'}}),
}));

const list = (propsByKey: Record<string, Record<string, unknown>>) =>
  ({
    orderedKeys: Object.keys(propsByKey),
    propsByKey,
  } as unknown as RuntimeAnimationList);

const level = {id: 14, name: 'free-play'} as unknown as LevelProperties;

function Probe({animationList}: {animationList: RuntimeAnimationList}) {
  useReportImageLoadFailures(animationList, level, 'chan');
  return null;
}

const failed = (sourceUrl?: string, loadFailure?: Record<string, unknown>) =>
  list({k1: {sourceUrl, loadFailed: true, loadFailure}});

describe('useReportImageLoadFailures', () => {
  beforeEach(() => sendEvent.mockClear());

  it('reports an image whose file failed to load, with its unit and level', () => {
    render(
      <Probe
        animationList={list({
          k1: {
            sourceUrl: '/v3/assets/chan/bg.png',
            role: 'platform-background',
            loadFailed: true,
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
        unitName: 'quest-builder-2026',
        levelId: 14,
        levelName: 'free-play',
      },
      true
    );
  });

  it('reports each failed image once, and again only when a new link fails', () => {
    const {rerender} = render(
      <Probe animationList={failed('/v3/assets/chan/a.png')} />
    );
    rerender(<Probe animationList={failed('/v3/assets/chan/a.png')} />);
    expect(sendEvent).toHaveBeenCalledTimes(1);
    // The image is replaced, and its new file loads.
    rerender(
      <Probe
        animationList={list({
          k1: {sourceUrl: '/v3/assets/chan/b.png', loadFailed: false},
        })}
      />
    );
    expect(sendEvent).toHaveBeenCalledTimes(1);
    rerender(<Probe animationList={failed('/v3/assets/chan/c.png')} />);
    expect(sendEvent).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['/v3/assets/chan/a.png', 'project'],
    ['/v3/assets/other/a.png', 'otherProject'],
    ['/level_starter_assets/lvl/a.png', 'level'],
    ['/blockly/media/a.png', 'other'],
    [undefined, 'none'],
  ])('says where the file %s lives: %s', (sourceUrl, file) => {
    render(<Probe animationList={failed(sourceUrl, {reason: 'network'})} />);
    expect(sendEvent.mock.calls[0][1]).toMatchObject({
      reason: 'network',
      file,
    });
  });

  it('reports a failure with no recorded reason as unknown', () => {
    render(<Probe animationList={failed('/v3/assets/chan/a.png')} />);
    expect(sendEvent.mock.calls[0][1]).toMatchObject({reason: 'unknown'});
  });
});
