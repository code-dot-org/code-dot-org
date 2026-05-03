import {test} from '@playwright/test';

/**
 * Markdown rendering — HTML details/summary tag behavior in a level page.
 *
 * Source: dashboard/test/ui/features/foundations/markdown_rendering.feature
 */
test.describe('Markdown rendering — details/summary tag', () => {
  test.fixme(
    'details element is closed on load and opens on click',
    async () => {
      // Source: foundations/markdown_rendering.feature @properties_encryption_key scenario.
      // allthethingscourse/units/1/lessons/21/levels/1 uses encrypted level properties
      // (CDO.properties_encryption_key).  Without the key the markdown content renders into
      // the DOM but remains hidden — #extra-details-tag never becomes visible.
      // Cucumber skips via @properties_encryption_key when the key is blank; we have no
      // equivalent conditional here.
    },
  );
});
