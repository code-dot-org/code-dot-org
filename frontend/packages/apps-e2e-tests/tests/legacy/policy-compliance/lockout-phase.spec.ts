import {mockCapLockoutPhase, createCapStudent} from '../../shared/cap';
import {test} from '../../shared/fixtures';

import {LockoutPhasePage} from './LockoutPhasePage';

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
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/policy_compliance/lockout_phase.feature
   * Scenario: Student account Under-13 in Colorado created before CAP start cannot change age and state
   */
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
      const lockoutPhase = new LockoutPhasePage(page);
      await lockoutPhase.gotoEditAndWaitForFields();
      await lockoutPhase.expectAgeAndStateDisabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/policy_compliance/lockout_phase.feature
   * Scenario: Student account Under-13 not in Colorado created after CAP start can change their age and state
   */
  test(
    'under-13 not in Colorado after CAP start: age and state are enabled',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      await createCapStudent(page, {young: true, timing: 'after'});
      const lockoutPhase = new LockoutPhasePage(page);
      await lockoutPhase.gotoEditAndWaitForFields();
      await lockoutPhase.expectAgeAndStateEnabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/policy_compliance/lockout_phase.feature
   * Scenario: Student account Under-13 not in Colorado created before CAP start can change their age and state
   */
  test(
    'under-13 not in Colorado before CAP start: age and state are enabled',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      await createCapStudent(page, {young: true, timing: 'before'});
      const lockoutPhase = new LockoutPhasePage(page);
      await lockoutPhase.gotoEditAndWaitForFields();
      await lockoutPhase.expectAgeAndStateEnabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/policy_compliance/lockout_phase.feature
   * Scenario: Student account Over-13 and in Colorado created after CAP start can change their age and state
   */
  test(
    'over-13 in Colorado after CAP start: age and state are enabled',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      await createCapStudent(page, {colorado: true, timing: 'after'});
      const lockoutPhase = new LockoutPhasePage(page);
      await lockoutPhase.gotoEditAndWaitForFields();
      await lockoutPhase.expectAgeAndStateEnabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/policy_compliance/lockout_phase.feature
   * Scenario: Student account Over-13 and in Colorado created before CAP start can change their age and state
   */
  test(
    'over-13 in Colorado before CAP start: age and state are enabled',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      await createCapStudent(page, {colorado: true, timing: 'before'});
      const lockoutPhase = new LockoutPhasePage(page);
      await lockoutPhase.gotoEditAndWaitForFields();
      await lockoutPhase.expectAgeAndStateEnabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/policy_compliance/lockout_phase.feature
   * Scenario: Student account under-13 and in Colorado created after CAP start using only clever cannot change their age and state
   */
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
      const lockoutPhase = new LockoutPhasePage(page);
      await lockoutPhase.gotoEditAndWaitForFields();
      await lockoutPhase.expectAgeAndStateDisabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/policy_compliance/lockout_phase.feature
   * Scenario: Student account under-13 and in Colorado created before CAP start using only clever cannot change their age and state
   */
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
      const lockoutPhase = new LockoutPhasePage(page);
      await lockoutPhase.gotoEditAndWaitForFields();
      await lockoutPhase.expectAgeAndStateDisabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/policy_compliance/lockout_phase.feature
   * Scenario: Student account under-13 and in Colorado created before CAP start using google cannot change their age and state
   */
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
      const lockoutPhase = new LockoutPhasePage(page);
      await lockoutPhase.gotoEditAndWaitForFields();
      await lockoutPhase.expectAgeAndStateDisabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/policy_compliance/lockout_phase.feature
   * Scenario: Student account under-13 not in Colorado created after CAP start using clever cannot change their age and state
   */
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
      const lockoutPhase = new LockoutPhasePage(page);
      await lockoutPhase.gotoEditAndWaitForFields();
      await lockoutPhase.expectAgeAndStateEnabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/policy_compliance/lockout_phase.feature
   * Scenario: Student account under-13 not in Colorado created before CAP start using clever cannot change their age and state
   */
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
      const lockoutPhase = new LockoutPhasePage(page);
      await lockoutPhase.gotoEditAndWaitForFields();
      await lockoutPhase.expectAgeAndStateEnabled();
    },
  );
});
