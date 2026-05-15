import {test} from '../../shared/fixtures';

import {RaceInterstitialPage} from './RaceInterstitialPage';

test.describe('Race interstitial', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/xteam/race_interstitial.feature
   * Scenario: Race Interstitial Shown And Dismissed
   */
  test('student can dismiss the forced race interstitial', async ({
    studentPage,
  }) => {
    const interstitial = new RaceInterstitialPage(studentPage);
    await interstitial.gotoForcedInterstitial();
    // Visual checkpoint stub: "race interstitial".

    await interstitial.dismissLater();
    // Visual checkpoint stub: "race interstitial closed".
  });
});
