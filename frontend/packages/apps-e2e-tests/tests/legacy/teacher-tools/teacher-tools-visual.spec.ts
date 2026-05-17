import {createStudent} from '../../shared/auth';
import {test} from '../../shared/fixtures';

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
    const visualPage = new TeacherToolsVisualPage(page);

    await eyes.open('Video thumbnail position');
    await visualPage.openBelowVisualizationLevel();
    await eyes.check('default visualization width');
    await visualPage.dragVisualizationResizeBar(400);
    await eyes.check('wider visualization');
    await visualPage.dragVisualizationResizeBar(-400);
    await eyes.check('narrower visualization');
  });
});
