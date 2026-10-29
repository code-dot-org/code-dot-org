import {
  noteTaPanelEntryPoint,
  presetIdFromLabel,
  sendTaEvent,
  takeTaPanelEntryPoint,
  truncateForStatsig,
} from '@cdo/apps/aiTeacherDrawer/analytics';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

describe('TA drawer analytics', () => {
  describe('truncateForStatsig', () => {
    it('leaves a string Statsig can hold intact', () => {
      expect(truncateForStatsig('Write an exit ticket')).toBe(
        'Write an exit ticket'
      );
    });

    it('marks a string it had to cut', () => {
      const truncated = truncateForStatsig('x'.repeat(100));

      expect(truncated).toHaveLength(64);
      expect(truncated.endsWith('…')).toBe(true);
    });

    it('keeps a string of exactly the limit', () => {
      const atLimit = 'y'.repeat(64);

      expect(truncateForStatsig(atLimit)).toBe(atLimit);
    });
  });

  describe('presetIdFromLabel', () => {
    it('reduces a label to a stable snake_case id', () => {
      expect(presetIdFromLabel('Give me an example')).toBe(
        'give_me_an_example'
      );
    });

    it('collapses punctuation rather than carrying it through', () => {
      expect(presetIdFromLabel('How to create a section?')).toBe(
        'how_to_create_a_section'
      );
    });
  });

  describe('panel entry point', () => {
    it('reports an unclaimed open as automatic', () => {
      expect(takeTaPanelEntryPoint()).toBe('auto_open');
    });

    it('hands the noted entry point to the first caller only', () => {
      noteTaPanelEntryPoint('fab');

      expect(takeTaPanelEntryPoint()).toBe('fab');
      expect(takeTaPanelEntryPoint()).toBe('auto_open');
    });
  });

  describe('sendTaEvent', () => {
    it('sends the value in Statsig’s own value field', () => {
      const sendEvent = jest
        .spyOn(analyticsReporter, 'sendEvent')
        .mockImplementation(() => {});

      sendTaEvent(EVENTS.AI_TA_TAB_CLICKED, {from_tab: 'Chats'}, 'Alerts');

      expect(sendEvent).toHaveBeenCalledWith(
        'ai_ta_tab_clicked',
        expect.objectContaining({from_tab: 'Chats'}),
        false,
        'Alerts'
      );

      sendEvent.mockRestore();
    });
  });
});
