import {RaceInterstitialModalComponent} from '../components/race-interstitial-modal';
import {expect, test} from '../fixtures';
import {waitForVisualStability} from '../shared/stability';

test.describe('Race Interstitial', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/xteam/race_interstitial.feature
   * "Race Interstitial Shown And Dismissed"
   * @eyes
   */
  test(
    'Race Interstitial Shown And Dismissed',
    {tag: ['@visual']},
    async ({page, signInAsNewUser, visualCheck}) => {
      const modal = new RaceInterstitialModalComponent(page);

      await signInAsNewUser({type: 'student', name: 'Test Student'});

      // RaceInterstitialHelper.show? gates on race data, sign-in age and US IP,
      // none of which a fresh account satisfies.
      await page.goto('/home?forceRaceInterstitial=true');

      await expect(modal.modal).toBeVisible();
      await waitForVisualStability(page, modal.dialog);
      await visualCheck('race interstitial');

      await modal.decline();
      await expect(modal.modal).not.toBeVisible();
      await visualCheck('race interstitial closed');
    },
  );
});
