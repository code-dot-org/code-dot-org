import {createTeacher} from '../../shared/auth';
import {test} from '../../shared/fixtures';

/**
 * Demo section card on the teacher homepage.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/teacher_dashboard/demo_section_card.feature
 *
 * Tagged @no_mobile.
 */

/**
 * Migration status: COMPLETED
 * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/demo_section_card.feature
 * Scenario: Teacher with zero sections can create a practice section from the homepage
 */
test(
  'teacher with zero sections can navigate to demo section progress',
  {tag: '@no_mobile'},
  async ({page}) => {
    await createTeacher(page);
    await page.goto('/teacher_dashboard/home?enableExperiments=demo-section');

    await page
      .locator('#ui-test-demo-section-card')
      .waitFor({state: 'visible', timeout: 30_000});

    const card = page.locator('#ui-test-demo-section-card');
    await card.getByText('High School Practice Section').waitFor({
      state: 'visible',
    });
    await card.getByText('Demo', {exact: true}).waitFor({state: 'visible'});

    await page.locator('#go-to-lesson-dropdown-button').click();
    await page
      .locator('#go-to-lesson-dropdown li')
      .first()
      .waitFor({state: 'visible'});

    await page.locator('#ui-test-demo-section-action-progress').click();
    await page.waitForURL(/\/teacher_dashboard\/sections\//, {timeout: 30_000});
    await page.waitForURL(/\/progress/, {timeout: 30_000});
  },
);
