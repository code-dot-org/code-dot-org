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

  test('gallery shows expected elements', async ({page}) => {
    // Scenario: Public Gallery Shows Expected Elements
    await new PublicProjectGalleryPage(page).expectExpectedElements();
  });

  test('gallery shows expected project types', async ({page}) => {
    // Scenario: Public Gallery Shows Expected Project Types
    await new PublicProjectGalleryPage(page).expectProjectTypes();
  });
});
