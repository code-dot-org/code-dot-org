// AI Tutor+ post-lesson review views. Each takes its data as props and owns
// only local state, styles, and browser APIs; `apps` still owns routing, auth,
// transport, Redux, analytics, AI chat, and the shared canvas.
export {default as LevelsAttemptedBox} from './StudentLessonStats/LevelsAttemptedBox';
export {default as PersonalizedWelcomeBox} from './PersonalizedWelcomeBox';
export {default as PreReviewBox} from './PreReviewBox';
export {default as PreSkillsCheck} from './PreSkillsCheck';
export {default as TimeSpentBox} from './StudentLessonStats/TimeSpentBox';
export {default as ValidatedLevelsBox} from './StudentLessonStats/ValidatedLevelsBox';
export {default as VideoRecorder} from './ChallengeActivities/VideoRecorder';
export {default as VocabularyFlashcards} from './ReviewModalities/VocabularyFlashcards';
export type {VocabularyItem} from './ReviewModalities/VocabularyFlashcards';
export {default as Waveform} from './ReviewModalities/Waveform';
export {default as WelcomeBox} from './WelcomeBox';
