import {
  firstProjectStepId,
  sendAdaptiveEvent,
  setAdaptiveMetricsContext,
} from '@cdo/apps/adaptive/metricsHelpers';
import {Pathway} from '@cdo/apps/adaptive/types';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: jest.fn()},
}));

describe('adaptive metrics', () => {
  it('sends the pathway context with each event and drops unset properties', () => {
    setAdaptiveMetricsContext({pathwayId: 'p', levelId: 1, scriptId: 2});
    sendAdaptiveEvent('Event', {a: 'x', b: undefined}, 'x');
    expect(analyticsReporter.sendEvent).toHaveBeenCalledWith(
      'Event',
      {pathwayId: 'p', levelId: 1, scriptId: 2, a: 'x'},
      true,
      'x'
    );
  });

  it('finds the first project step in authored order', () => {
    const pathway = {
      checkpoints: [
        {id: 'c1', steps: [{id: 's1', kind: 'panels'}]},
        {
          id: 'c2',
          steps: [
            {id: 's2', kind: 'level', project: false},
            {id: 's3', kind: 'level', project: true},
          ],
        },
        {id: 'c3', steps: [{id: 's4', kind: 'level', project: true}]},
      ],
    } as unknown as Pathway;
    expect(firstProjectStepId(pathway)).toBe('s3');
  });
});
