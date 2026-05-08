import {type Page} from '@playwright/test';

import {mockCapLockoutPhase, createCapStudent} from '../../shared/cap';
import {expect, test} from '../../shared/fixtures';

/**
 * Child Account Policy — lockout phase: age/state field editability.
 *
 * Source:
 *   dashboard/test/ui/features/platform/policy_compliance/lockout_phase.feature
 *
 * Rule: young (<13) + Colorado + (any SSO or created after cap_start) →
 *   #user_age and #user_us_state are disabled.
 * All other combinations → fields are enabled.
 */

test.describe('CPA lockout phase — age/state field editability', () => {
  /** Navigate to /users/edit and wait for both fields to be present. */
  async function gotoEditAndWaitForFields(page: Page): Promise<void> {
    await page.goto('/users/edit');
    // /users/edit renders the form twice (mobile/desktop variants); .first() picks the primary field.
    await expect(page.locator('#user_age').first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('#user_us_state').first()).toBeVisible({
      timeout: 15_000,
    });
  }

  test(
    'under-13 in Colorado before CAP start: age and state are disabled',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      await createCapStudent(page, {
        young: true,
        colorado: true,
        timing: 'before',
      });
      await gotoEditAndWaitForFields(page);
      await expect(page.locator('#user_us_state').first()).toBeDisabled();
      await expect(page.locator('#user_age').first()).toBeDisabled();
    },
  );

  test(
    'under-13 not in Colorado after CAP start: age and state are enabled',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      await createCapStudent(page, {young: true, timing: 'after'});
      await gotoEditAndWaitForFields(page);
      await expect(page.locator('#user_us_state').first()).toBeEnabled();
      await expect(page.locator('#user_age').first()).toBeEnabled();
    },
  );

  test(
    'under-13 not in Colorado before CAP start: age and state are enabled',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      await createCapStudent(page, {young: true, timing: 'before'});
      await gotoEditAndWaitForFields(page);
      await expect(page.locator('#user_us_state').first()).toBeEnabled();
      await expect(page.locator('#user_age').first()).toBeEnabled();
    },
  );

  test(
    'over-13 in Colorado after CAP start: age and state are enabled',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      await createCapStudent(page, {colorado: true, timing: 'after'});
      await gotoEditAndWaitForFields(page);
      await expect(page.locator('#user_us_state').first()).toBeEnabled();
      await expect(page.locator('#user_age').first()).toBeEnabled();
    },
  );

  test(
    'over-13 in Colorado before CAP start: age and state are enabled',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      await createCapStudent(page, {colorado: true, timing: 'before'});
      await gotoEditAndWaitForFields(page);
      await expect(page.locator('#user_us_state').first()).toBeEnabled();
      await expect(page.locator('#user_age').first()).toBeEnabled();
    },
  );

  test(
    'under-13 Clever SSO in Colorado after CAP start: age and state are disabled',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      await createCapStudent(page, {
        young: true,
        colorado: true,
        sso: 'clever',
        timing: 'after',
      });
      await gotoEditAndWaitForFields(page);
      await expect(page.locator('#user_us_state').first()).toBeDisabled();
      await expect(page.locator('#user_age').first()).toBeDisabled();
    },
  );

  test(
    'under-13 Clever SSO in Colorado before CAP start: age and state are disabled',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      await createCapStudent(page, {
        young: true,
        colorado: true,
        sso: 'clever',
        timing: 'before',
      });
      await gotoEditAndWaitForFields(page);
      await expect(page.locator('#user_us_state').first()).toBeDisabled();
      await expect(page.locator('#user_age').first()).toBeDisabled();
    },
  );

  test(
    'under-13 Google SSO in Colorado before CAP start: age and state are disabled',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      await createCapStudent(page, {
        young: true,
        colorado: true,
        sso: 'google',
        timing: 'before',
      });
      await gotoEditAndWaitForFields(page);
      await expect(page.locator('#user_us_state').first()).toBeDisabled();
      await expect(page.locator('#user_age').first()).toBeDisabled();
    },
  );

  test(
    'under-13 Clever SSO not in Colorado after CAP start: age and state are enabled',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      await createCapStudent(page, {
        young: true,
        sso: 'clever',
        timing: 'after',
      });
      await gotoEditAndWaitForFields(page);
      await expect(page.locator('#user_us_state').first()).toBeEnabled();
      await expect(page.locator('#user_age').first()).toBeEnabled();
    },
  );

  test(
    'under-13 Clever SSO not in Colorado before CAP start: age and state are enabled',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      await createCapStudent(page, {
        young: true,
        sso: 'clever',
        timing: 'before',
      });
      await gotoEditAndWaitForFields(page);
      await expect(page.locator('#user_us_state').first()).toBeEnabled();
      await expect(page.locator('#user_age').first()).toBeEnabled();
    },
  );
});
