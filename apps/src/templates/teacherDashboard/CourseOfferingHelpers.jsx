import i18n from '@cdo/locale';

// Same list as CourseOfferingCsTopics in sharedCourseConstants but with translated strings
export const translatedCourseOfferingCsTopics = {
  art_and_design: i18n.courseOfferingCsTopicArtAndDesign(),
  app_design: i18n.courseOfferingCsTopicAppDesign(),
  artificial_intelligence: i18n.courseOfferingCsTopicAI(),
  cybersecurity: i18n.courseOfferingCsTopicCybersecurity(),
  data: i18n.courseOfferingCsTopicData(),
  games_and_animations: i18n.courseOfferingCsTopicGamesAndAnimations(),
  internet: i18n.courseOfferingCsTopicInternet(),
  physical_computing: i18n.courseOfferingCsTopicPhysicalComputing(),
  web_design: i18n.courseOfferingCsTopicWebDesign(),
  programming: i18n.courseOfferingCsTopicProgramming(),
};

export const translatedInterdisciplinary = {
  interdisciplinary: i18n.courseOfferingInterdisciplinary(),
};

// Same list as CourseOfferingSchoolSubjects in sharedCourseConstants but with translated strings
export const translatedCourseOfferingSchoolSubjects = {
  math: i18n.courseOfferingSchoolSubjectMath(),
  science: i18n.courseOfferingSchoolSubjectScience(),
  english_language_arts: i18n.courseOfferingSchoolSubjectEnglishLanguageArts(),
  history: i18n.courseOfferingSchoolSubjectHistory(),
};

// Same list as DeviceTypes in sharedCourseConstants but with translated strings
export const translatedCourseOfferingDeviceTypes = {
  computer: i18n.courseOfferingDeviceTypeComputer(),
  chromebook: i18n.courseOfferingDeviceTypeChromebook(),
  tablet: i18n.courseOfferingDeviceTypeTablet(),
  mobile: i18n.courseOfferingDeviceTypeMobile(),
  no_device: i18n.courseOfferingDeviceTypeNoDevice(),
};

// Same list as DeviceCompatibilityLevels in sharedCourseConstants but with translated strings
export const translatedCourseOfferingDeviceCompatibilityLevels = {
  ideal: i18n.courseOfferingDeviceCompatibilityLevelIdeal(),
  not_recommended: i18n.courseOfferingDeviceCompatibilityLevelNotRecommended(),
  incompatible: i18n.courseOfferingDeviceCompatibilityLevelIncompatible(),
};

export const translatedCourseOfferingDurations = {
  school_year: i18n.schoolYear(),
  semester: i18n.semester(),
  quarter: i18n.quarter(),
  month: i18n.month(),
  week: i18n.week(),
  lesson: i18n.lesson(),
};

export const translatedGradeLevels = {
  kindergarten: i18n.kindergarten(),
  grade_1: i18n.gradeLevel({number: 1}),
  grade_2: i18n.gradeLevel({number: 2}),
  grade_3: i18n.gradeLevel({number: 3}),
  grade_4: i18n.gradeLevel({number: 4}),
  grade_5: i18n.gradeLevel({number: 5}),
  grade_6: i18n.gradeLevel({number: 6}),
  grade_7: i18n.gradeLevel({number: 7}),
  grade_8: i18n.gradeLevel({number: 8}),
  grade_9: i18n.gradeLevel({number: 9}),
  grade_10: i18n.gradeLevel({number: 10}),
  grade_11: i18n.gradeLevel({number: 11}),
  grade_12: i18n.gradeLevel({number: 12}),
};

export const subjectsAndTopicsOrder = [
  'math',
  'science',
  'english_language_arts',
  'history',
  'artificial_intelligence',
  'web_design',
  'cybersecurity',
  'physical_computing',
  'internet',
  'app_design',
  'games_and_animations',
  'art_and_design',
  'data',
  'programming',
];
