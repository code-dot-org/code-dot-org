import {test} from '../../shared/fixtures';

import {PublicProjectGalleryPage} from './PublicProjectGalleryPage';

/**
 * Public project gallery — signed-out view at /projects/public.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/projects/public_project_gallery_signed_out.feature
 *
 * Anonymous; no authentication required.
 */

test.describe('Public project gallery — signed out', () => {
  test.beforeEach(async ({page}) => {
    await new PublicProjectGalleryPage(page).goto();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/projects/public_project_gallery_signed_out.feature
   * Scenario: Public Gallery Shows Expected Elements
   */
  test('gallery shows expected elements', async ({page}) => {
    await new PublicProjectGalleryPage(page).expectExpectedElements();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/projects/public_project_gallery_signed_out.feature
   * Scenario: Public Gallery Shows Expected Project Types
   */
  test('gallery shows expected project types', async ({page}) => {
    await new PublicProjectGalleryPage(page).expectProjectTypes();
  });
});
