import {createStudent} from '../../shared/auth';
import {test} from '../../shared/fixtures';

import {WebLabProjectPage} from './WebLabProjectPage';

test.describe('Web Lab', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/weblab/weblab.feature
   * Scenario: Web Lab iframe contents loads
   */
  test('Web Lab iframe contents loads', {tag: '@no_mobile'}, async ({page}) => {
    await createStudent(page);
    const weblab = new WebLabProjectPage(page);

    await weblab.gotoNewProject();
    await weblab.expectEditorLoaded();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/weblab/versions.feature
   * Scenario: Weblab Versions
   */
  test('Weblab Versions', async () => {
    test.skip(
      true,
      'Source Cucumber scenario is @skip/@no_ci. Source: dashboard/test/ui/features/star_labs/weblab/versions.feature Scenario: Weblab Versions',
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/weblab/weblab_submittable.feature
   * Scenario: Submit anything, unsubmit, be able to resubmit.
   */
  test('submit, unsubmit, and resubmit Web Lab level', async () => {
    test.skip(
      true,
      'Source Cucumber scenario is @skip/@no_ci. Source: dashboard/test/ui/features/star_labs/weblab/weblab_submittable.feature Scenario: Submit anything, unsubmit, be able to resubmit.',
    );
  });
});
