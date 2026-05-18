import {test} from '../../shared/fixtures';

import {OceansMlHocPage} from './OceansMlHocPage';

test.describe('Oceans ML Hour of Code', {tag: ['@no_ci', '@no_mobile']}, () => {
  test.skip(
    ({browserName}) => browserName === 'webkit',
    'Source Cucumber feature is @no_safari: dashboard/test/ui/features/student_learning/hour_of_code/ml_hoc.feature',
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/ml_hoc.feature
   * Scenario: Fish vs. Trash
   */
  test('Fish vs. Trash', async ({page}) => {
    const oceans = new OceansMlHocPage(page);

    await oceans.gotoLevel(2);
    await oceans.train('Fish', 'Not Fish');
    await oceans.runSortingAndContinue();
    await oceans.expectPondAction('Continue');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/ml_hoc.feature
   * Scenario: Sea Creatures
   */
  test('Sea Creatures', async ({page}) => {
    const oceans = new OceansMlHocPage(page);

    await oceans.gotoLevel(3);
    await oceans.button('Run').click();
    await oceans.expectPondAction('Continue');
    await oceans.gotoLevel(4);
    await oceans.train('Yes', 'No');
    await oceans.runSortingAndContinue();
    await oceans.expectPondAction('Continue');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/ml_hoc.feature
   * Scenario: Short Word List
   */
  test('Short Word List', async ({page}) => {
    const oceans = new OceansMlHocPage(page);

    await oceans.gotoLevel(6);
    await oceans.chooseCategoryAndTrain('Blue', 'Not Blue');
    await oceans.runSortingAndContinue();
    await oceans.expectPondAction('Continue');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/ml_hoc.feature
   * Scenario: Long Word List
   */
  test('Long Word List', async ({page}) => {
    const oceans = new OceansMlHocPage(page);

    await oceans.gotoLevel(8);
    await oceans.chooseCategoryAndTrain('Fierce', 'Not Fierce');
    await oceans.runSortingAndContinue();
    await oceans.expectPondAction('Finish');
  });
});
