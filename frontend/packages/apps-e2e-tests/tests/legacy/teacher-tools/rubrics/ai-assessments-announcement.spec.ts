import {createTeacher} from '../../../shared/auth';
import {test} from '../../../shared/fixtures';

import {AiAssessmentsAnnouncementPage} from './AiAssessmentsAnnouncementPage';

/**
 * AI Assessments Announcement — banner shown to teachers on AI-enabled units.
 *
 * Source: dashboard/test/ui/features/teacher_tools/rubrics/ai_assessments_announcement.feature
 */

test.describe('AI Assessments Announcement', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/rubrics/ai_assessments_announcement.feature
   * Scenario: Teacher views and closes announcement
   */
  test('teacher views and closes announcement', async ({page}) => {
    await createTeacher(page);
    const announcement = new AiAssessmentsAnnouncementPage(page);

    await announcement.expectNoAnnouncementOnNonAiUnit();
    await announcement.gotoAiUnitWithAnnouncement();
    await announcement.closeAnnouncement();
    await announcement.expectAnnouncementDismissedOnAiUnit();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/rubrics/ai_assessments_announcement.feature
   * Scenario: Teacher views announcement and clicks learn more
   */
  test('teacher clicks learn more and announcement stays dismissed', async ({
    page,
  }) => {
    await createTeacher(page);
    const announcement = new AiAssessmentsAnnouncementPage(page);

    await announcement.gotoAiUnitWithAnnouncement();
    await announcement.clickLearnMoreWithoutLeavingStudio();
    await announcement.expectAnnouncementDismissedOnAiUnit();
  });
});
