import {test} from '@playwright/test';

// BLOCKED: AI feature journeys require either:
// - AI provider credentials (not available in local development)
// - Aichat/Ailab-type levels seeded in local curriculum data
// - Rubric levels with student submissions
//
// The features are STRONGLY SUPPORTED by code + Cucumber features:
//   dashboard/test/ui/features/star_labs/aichat/
//   dashboard/test/ui/features/star_labs/ai_tutor/chat.feature
//   dashboard/test/ui/features/teacher_tools/rubrics/ai_evaluate_student_code.feature
//   dashboard/test/ui/features/teacher_tools/ai_diff/ai_differentiation_chat.feature
//
// The AI Settings tab on teacher dashboard is reachable but only appears when
// the section is assigned to a course with AI Chat levels, which requires
// specific curriculum data seeded locally.
//
// Label assertions (from i18n en_us.json, revision 9793f8d36ae):
//   "Run AI Assessment for Project" (runAiAssessment) - per-student button
//   "Run AI Assessment for Class" (runAiAssessmentClass) - class-wide button
//   "Is AI accurate?" (aiAssessmentFeedbackAsk) - feedback prompt
//   "Extensive or Convincing Evidence" (aiAssessmentDoesMeet) - AI score label
//   "Limited or No Evidence" (aiAssessmentDoesNotMeet) - AI score label

// test.fixme(title, body) takes a callback, not a reason string: the four
// calls below previously passed a string as the second argument, which
// Playwright silently drops (0 tests registered, not even as skipped).
test.fixme('teacher reviews AI evaluation on a rubric level', () => {
  // Requires AI provider credentials and rubric level with student work.
});
test.fixme('teacher controls AI Chat access in section settings', () => {
  // Requires a section assigned to a course with AI Chat levels.
});
test.fixme('student uses AI Chat in a lesson', () => {
  // Requires AI provider credentials and AI Chat level.
});
test.fixme('student trains a model in AI Lab', () => {
  // Requires AI Lab level seeded locally.
});
