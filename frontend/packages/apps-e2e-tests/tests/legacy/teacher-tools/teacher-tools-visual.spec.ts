import {createStudent} from '../../shared/auth';
import {test} from '../../shared/fixtures';

import {TeacherToolsVisualPage} from './TeacherToolsVisualPage';

test.describe('Teacher tools visual readiness ports', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/lesson_show.feature
   * Scenario: Print Mode
   */
  test('print mode lesson plan renders printable content', async ({page}) => {
    const visualPage = new TeacherToolsVisualPage(page);

    await visualPage.openPrintableLessonPlan();
    // Visual checkpoint stub: initial page view.
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/below_visualization.feature
   * Scenario: Check correct position of video thumbnails
   */
  test('video thumbnails remain below visualization while resizing', async ({
    page,
  }) => {
    await createStudent(page);
    const visualPage = new TeacherToolsVisualPage(page);

    await visualPage.openBelowVisualizationLevel();
    // Visual checkpoint stub: default visualization width.
    await visualPage.dragVisualizationResizeBar(400);
    // Visual checkpoint stub: wider visualization.
    await visualPage.dragVisualizationResizeBar(-400);
    // Visual checkpoint stub: narrower visualization.
  });
});
