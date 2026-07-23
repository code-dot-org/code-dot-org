// English locale strings for standalone dev/test. The production host
// provides @cdo/locale via its webpack alias; this file is only used
// by vitest and the Vite dev server.
//
// Strings are extracted from apps/build/locales/en_us/common_locale.js
// for every key the homepage components reference. A Proxy fallback
// handles any missed keys with a warning.

type I18nFn = (d?: any) => string;

/** ICU plural helper matching the generated locale runtime. */
function plural(
  value: number,
  _offset: number,
  _lcfunc: (n: number, ord?: boolean) => string,
  data: Record<string, string>,
): string {
  if (value in data) return data[value];
  return value === 1 && 'one' in data ? data.one : (data.other ?? '');
}

const STRINGS: Record<string, I18nFn> = {
  // -- simple strings (no interpolation) --
  addStudents: () => 'Add students',
  afeBannerParagraph: () =>
    'Amazon Future Engineer offers support for CodeAI classrooms, including posters, CSTA membership, internship and scholarship opportunities, and access to cloud computing resources at no cost.',
  afeDrawerHeader: () =>
    "You're eligible for resources from Amazon Future Engineer",
  archive: () => 'Archive',
  archiveAllNote: () =>
    'Note: this will archive all class sections you are teaching including sections that were created by another teacher that you are coteaching.',
  archiveAllSections: () => 'Archive all class sections',
  archived: () => 'Archived',
  archivedAllSections: () => 'All class sections archived',
  archiveWarning: () => 'Archive all class sections?',
  assignACourseButton: () => 'Assign a course',
  avatar: () => 'Avatar',
  avatarEditDialogDescription: () =>
    'This dialog allows you to set your section avatar from a selection of emojis and background colors.',
  cancel: () => 'Cancel',
  censusHeading: () => 'Tell us about your school',
  certificates: () => 'Certificates',
  chooseColor: () => 'Choose a background color',
  chooseEmoji: () => 'Choose an emoji',
  classSections: () => 'Class Sections',
  closeDialog: () => 'Close',
  copySectionCodeSuccess: () => 'Link copied!',
  copySectionCodeTooltip: () =>
    'Click here to copy the link students need to join the section',
  course: () => 'Course',
  delete: () => 'Delete',
  deleteSection: () => 'Delete Section',
  deleteSectionConfirm: () =>
    'Are you sure you want to delete this section? You will not be able to undo this.',
  dialogCancel: () => 'Cancel',
  dismiss: () => 'Dismiss',
  dragSection: () => 'Drag section to reorder',
  editAvatar: () => 'Edit avatar',
  emptyArchivedClassSections: () =>
    "You haven't archived any class sections yet.",
  emptyClassSections: () => "You haven't created any class sections yet.",
  emptySectionHeadline: () => "It's a bit empty here...",
  goToCourse: () => 'Go to course',
  helpUsImprove: () => 'Help us improve CodeAI!',
  imAtaNewSchool: () => "I'm at a new school",
  imStillTeachingHere: () => "I'm still teaching here",
  jumpTo: () => 'Jump to',
  learnMore: () => 'Learn more',
  loading: () => 'Loading...',
  loginCards: () => 'Login cards',
  loginTypeClever: () => 'Clever',
  loginTypeGoogleClassroom: () => 'Google Classroom',
  moreOptions: () => 'More options',
  newClassSection: () => 'New class section',
  notApplicable: () => 'N/A',
  notInterested: () => "I'm not interested",
  NPSSuccessBody: () =>
    'Your responses will help us shape and improve the CodeAI experience for everyone.',
  NPSSuccessHeader: () => 'Thank you for your answers!',
  ok: () => 'OK',
  partnershipWith: () => 'In partnership with',
  personalizationInvitation: () =>
    'Want a more personalized CodeAI experience?',
  personalizationLinkText: () => 'Help us get to know you!',
  rebrandBannerButton: () => 'Learn more',
  rebrandBannerSubheader: () => 'Code.org is now CodeAI',
  rebrandBannerText: () =>
    'Because every student deserves to thrive in a world reshaped by AI.',
  restoreClassSection: () => 'Restore class section',
  reviewSchoolInfo: () => 'Review your school information',
  roster: () => 'Roster',
  save: () => 'Save',
  schoolInfoDialogDescription: () =>
    'Welcome back!  Are you still teaching at ',
  schoolInfoDialogDescriptionNoName: () => 'the same school',
  schoolInfoDrawerSuccess: () =>
    "Thank you for helping us track our progress and support computer science education. We'll periodically check in to make sure your school information is up-to-date. You can also update this information at any time from your account settings.",
  schoolInfoInterstitialTitle: () =>
    'We want to bring Computer Science to every student - help us track our progress!',
  schoolInfoInterstitialUnknownError: () =>
    'We encountered an error with your submission. Please try again.',
  sectionCodeWithColon: () => 'Section Code:',
  sectionOptionsDropdown: () => 'Section options dropdown',
  sectionSettings: () => 'Section settings',
  selectAvatar: () => 'Select avatar',
  statsTableFailure: () =>
    'Sorry, something went wrong. Please reload the page to try again.',
  studentsCompletedUnit: () => 'Most students have completed the assigned unit',
  suggestedLesson: () => 'Suggested lesson',
  teaching: () => 'Teaching',
  thankYouForUpdatingYourSchool: () => 'Thank you for updating your school!',
  viewLessonMaterialsButton: () => 'View lesson materials',
  viewProgressButton: () => 'View progress',
  welcomeWithoutName: () => 'Welcome',
  whatCountry: () => 'What country are you located in?',
  whyWithQuestionMark: () => 'Why?',

  // -- interpolated strings --
  welcome: (d: {teacherName: string}) => `Welcome, ${d.teacherName}`,
  schoolInfoDialogDescriptionSchoolName: (d: {schoolName: string}) =>
    `${d.schoolName}?`,
  noSectionDialogHeader: (d: {classroom: string}) =>
    `Why don't ${d.classroom} sections have Section Codes?`,
  noSectionDialogBody: (d: {classroom: string}) =>
    `${d.classroom} sections' lists of students reflect your externally-managed ${d.classroom} roster. In order to add or remove a student from this section, please first add or remove them from the corresponding classroom in ${d.classroom}, then click the "Sync Students from ${d.classroom}" button in the top left corner of the Manage Students tab.`,
  syncAllLoginTypeSections: (d: {loginType: string}) =>
    `Sync all ${d.loginType} sections`,

  // -- pluralized strings --
  studentsAdded: (d: {numStudents: number}) =>
    plural(d.numStudents, 0, () => 'other', {
      one: `${d.numStudents} student`,
      other: `${d.numStudents} students`,
    }) + ' added',
  numArchivedSections: (d: {numHidden: number}) =>
    plural(d.numHidden, 0, () => 'other', {
      one: '1 section was',
      other: `${d.numHidden} sections were`,
    }) + ' archived.',
};

/** Convert camelCase to Title Case for fallback display. */
function camelToTitle(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, c => c.toUpperCase())
    .trim();
}

const i18n: Record<string, I18nFn> = new Proxy(STRINGS, {
  get(target, prop: string) {
    if (prop in target) return target[prop];
    // Fallback: warn and return a humanized key name.

    console.warn(`[locale stub] missing key: "${prop}"`);
    return () => camelToTitle(prop);
  },
});

export default i18n;
