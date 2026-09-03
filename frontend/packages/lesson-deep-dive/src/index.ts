// Public API for @code-dot-org/lesson-deep-dive
// Export all public symbols from this file.
export {default as LevelsAttemptedBox} from './StudentLessonStats/LevelsAttemptedBox';
export {default as PersonalizedWelcomeBox} from './PersonalizedWelcomeBox';
export {default as PreReviewBox} from './PreReviewBox';
export {default as PreSkillsCheck} from './PreSkillsCheck';
export {default as TimeSpentBox} from './StudentLessonStats/TimeSpentBox';
export {default as TutorSummaryBox} from './TutorSummaryBox';
export {default as ValidatedLevelsBox} from './StudentLessonStats/ValidatedLevelsBox';
export {default as VideoRecorder} from './ChallengeActivities/VideoRecorder';
export {default as VocabularyFlashcards} from './ReviewModalities/VocabularyFlashcards';
export type {VocabularyItem} from './ReviewModalities/VocabularyFlashcards';
export {default as WelcomeBox} from './WelcomeBox';

export {
  ExplanationTypes,
  EvaluationStatus,
  challengeResponseValidator,
  challengeResponseListValidator,
  challengeValidator,
} from './types';
export type {
  Challenge,
  ChallengeResponse,
  ChallengeResponseAsset,
} from './types';

export {assetWithUrl} from './gallery/assetUtils';
export {
  challengeResponseDetailValidator,
  unitCountsValidator,
  tutorGalleryDataValidator,
} from './gallery/types';
export type {
  ChallengeResponseDetail,
  EvaluationResult,
  GallerySection,
  GallerySort,
  GalleryUnit,
  Reaction,
  RubricEntry,
  TutorGalleryData,
  ViewerRole,
} from './gallery/types';

export {
  getChallengeResponse,
  getTutorGalleryData,
  getUnitCounts,
  listChallengeResponses,
} from './gallery/api';

export {default as AssessmentPanel} from './gallery/AssessmentPanel';
export {default as ChallengeGallery} from './gallery/ChallengeGallery';
export {default as GallerySidebar} from './gallery/GallerySidebar';
export {
  default as ProjectCard,
  type ProjectVariant,
} from './gallery/ProjectCard';
export {default as ProjectDetailsCard} from './gallery/ProjectDetailsCard';
export {default as ProjectStage} from './gallery/ProjectStage';
export {default as ProjectView} from './gallery/ProjectView';
export {default as ReactionChips} from './gallery/ReactionChips';
export {default as TutorGalleryPage} from './gallery/TutorGalleryPage';
