import {createStudent} from '../../shared/auth';
import {test} from '../../shared/fixtures';

import {BelowVisualizationPage} from './BelowVisualizationPage';

/**
 * Migration status: COMPLETED
 * Source: dashboard/test/ui/features/teacher_tools/below_visualization.feature
 * Scenario: Check correct position of video thumbnails
 */
test('video thumbnails stay below visualization as it resizes', async ({
  page,
  eyes,
}) => {
  const belowVisualizationPage = new BelowVisualizationPage(page);
  await createStudent(page);
  await eyes.open('Video thumbnail position');
  await belowVisualizationPage.gotoVideoThumbnailLevel();
  await eyes.checkRegion('#visualizationColumn', 'default visualization width');

  await belowVisualizationPage.dragVisualizationGrippy(400);
  await eyes.checkRegion('#visualizationColumn', 'wider visualization');

  await belowVisualizationPage.dragVisualizationGrippy(-400);
  await eyes.checkRegion('#visualizationColumn', 'narrower visualization');
});
