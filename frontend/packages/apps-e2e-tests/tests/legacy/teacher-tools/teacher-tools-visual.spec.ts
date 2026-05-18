import {createStudent} from '../../shared/auth';
import {test} from '../../shared/fixtures';
import {BelowVisualizationPage} from '../below-visualization/BelowVisualizationPage';

import {TeacherToolsVisualPage} from './TeacherToolsVisualPage';

test.describe('Teacher tools visual readiness ports', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/lesson_show.feature
   * Scenario: Print Mode
   */
  test('print mode lesson plan renders printable content', async ({
    page,
    eyes,
  }) => {
    const visualPage = new TeacherToolsVisualPage(page);

    await eyes.open('printed lesson plan');
    await visualPage.openPrintableLessonPlan();
    await eyes.check('initial page view');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/below_visualization.feature
   * Scenario: Check correct position of video thumbnails
   */
  test('video thumbnails remain below visualization while resizing', async ({
    page,
    eyes,
  }) => {
    await createStudent(page);
    const visualPage = new BelowVisualizationPage(page);

    await eyes.open('Video thumbnail position');
    await visualPage.gotoVideoThumbnailLevel();
    await eyes.checkRegion(
      '#visualizationColumn',
      'default visualization width',
    );
    await visualPage.dragVisualizationGrippy(400);
    await eyes.checkRegion('#visualizationColumn', 'wider visualization');
    await visualPage.dragVisualizationGrippy(-400);
    await eyes.checkRegion('#visualizationColumn', 'narrower visualization');
  });
});
