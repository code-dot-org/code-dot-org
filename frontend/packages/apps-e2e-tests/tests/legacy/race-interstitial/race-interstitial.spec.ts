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
    eyes,
  }) => {
    await eyes.open('Race Interstitial Shown And Dismissed');
    const interstitial = new RaceInterstitialPage(studentPage);
    await interstitial.gotoForcedInterstitial();
    await eyes.check('race interstitial');

    await interstitial.dismissLater();
    await eyes.check('race interstitial closed');
  });
});
