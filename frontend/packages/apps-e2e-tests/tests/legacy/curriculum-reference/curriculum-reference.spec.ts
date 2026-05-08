import {test} from '../../shared/fixtures';

/**
 * Curriculum reference level type — lesson 35 of allthethingscourse unit 1.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/level_types/curriculum_reference.feature
 *
 * The entire feature is tagged @eyes (Applitools visual regression).
 * Both scenarios take a screenshot of the #curriculum-reference iframe and
 * compare against a stored baseline — there is no behavioral assertion to port.
 * Stubbed as fixme pending visual regression infrastructure.
 */
test.describe('Curriculum reference — lesson 35', () => {
  test.fixme(
    'curriculum reference level: initial load screenshot',
    async () => {
      // Source: curriculum_reference.feature scenario outline row 1
      // @eyes — Applitools screenshot of lesson 35/levels/1 #curriculum-reference iframe.
    },
  );

  test.fixme(
    'map level inside curriculum reference: initial load screenshot',
    async () => {
      // Source: curriculum_reference.feature scenario outline row 2
      // @eyes — Applitools screenshot of lesson 35/levels/2 #curriculum-reference iframe.
    },
  );
});
