import {expect, test} from '@playwright/test';

import {PublicProjectGalleryPage} from '../pages/public-project-gallery';

test.describe('Public Project Gallery - Signed Out', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/projects/public_project_gallery_signed_out.feature "Public Gallery Shows Expected Elements"
   */
  test('Public Gallery Shows Expected Elements', async ({page}) => {
    const gallery = new PublicProjectGalleryPage(page);

    await gallery.goto();

    await expect(gallery.pageHeading).toBeVisible();
    await expect(gallery.publicProjectsSection).toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/projects/public_project_gallery_signed_out.feature "Public Gallery Shows Expected Project Types"
   */
  test('Public Gallery Shows Expected Project Types', async ({page}) => {
    const gallery = new PublicProjectGalleryPage(page);

    await gallery.goto();

    await expect(gallery.publicProjectsSection).toBeVisible();
    await expect(gallery.projectAppTypeAreas).toHaveCount(1);
    await expect(gallery.featuredProjectsHeading).toBeVisible();
  });
});
