// Individual curricula definitions
const makerCurriculum = {
  key: 'devices',
  display_name: 'Creating Apps for Devices',
  display_name_with_latest_year: 'Creating Apps for Devices (2022)',
  grade_levels: '6,7,8,9,10,11,12',
  image: 'devices.png',
  duration: 'week',
  cs_topic: 'art_and_design,app_design,physical_computing,programming',
  school_subject: null,
  course_version_path: '/s/course',
  is_translated: false,
  device_compatibility: null,
  description: null,
  professional_learning_program: null,
  video: null,
  published_date: null,
  self_paced_pl_course_offering_path: null,
};

const countingCurriculum = {
  key: 'counting-csc',
  display_name: 'Computer Science Connections',
  display_name_with_latest_year: 'Computer Science Connections (2023)',
  grade_levels: '3,4,5',
  image: 'csc.png',
  duration: 'lesson',
  cs_topic: 'programming',
  school_subject: 'math',
  device_compatibility:
    '{"computer":"ideal","chromebook":"ideal","tablet":"not_recommended","mobile":"not_recommended","no_device":"incompatible"}',
  course_version_path: '/s/course',
  is_translated: false,
  description: null,
  professional_learning_program: null,
  video: null,
  published_date: null,
  self_paced_pl_course_offering_path: null,
};

const poemArtCurriculum = {
  key: 'poem-art',
  display_name: 'Poem Art',
  display_name_with_latest_year: 'Poem Art (2017)',
  grade_levels: '2,3,4,5,6,7,8,9,10,11,12',
  image: null,
  duration: 'lesson',
  cs_topic: 'art_and_design,games_and_animations,programming',
  school_subject: 'english_language_arts',
  device_compatibility:
    '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
  course_version_path: '/s/course',
  is_translated: false,
  description: null,
  professional_learning_program: null,
  video: null,
  published_date: null,
  self_paced_pl_course_offering_path: null,
};

const danceUnpluggedCurriculum = {
  key: 'dance-unplugged',
  display_name: 'Hour of Code - Dance Party - Unplugged',
  display_name_with_latest_year:
    'Hour of Code - Dance Party - Unplugged (2018)',
  grade_levels: '2,3,4,5,6,7,8',
  image: null,
  duration: 'lesson',
  cs_topic: 'data,programming',
  school_subject: null,
  device_compatibility:
    '{"computer":"incompatible","chromebook":"incompatible","tablet":"incompatible","mobile":"incompatible","no_device":"ideal"}',
  course_version_path: '/s/course',
  is_translated: false,
  description: null,
  professional_learning_program: null,
  video: null,
  published_date: null,
  self_paced_pl_course_offering_path: null,
};

const course1Curriculum = {
  key: 'course1',
  display_name: 'Course 1',
  display_name_with_latest_year: 'Course 1 (2012)',
  grade_levels: 'K,1',
  image: null,
  duration: 'lesson',
  cs_topic: 'programming',
  school_subject: null,
  device_compatibility:
    '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
  course_version_path: '/s/course',
  is_translated: true,
  description: null,
  professional_learning_program: null,
  video: null,
  published_date: null,
  self_paced_pl_course_offering_path: null,
};

const course2Curriculum = {
  key: 'course2',
  display_name: 'Course 2',
  display_name_with_latest_year: 'Course 2 (2012)',
  grade_levels: '2,3,4,5',
  image: 'course2.png',
  duration: 'lesson',
  cs_topic: 'programming',
  school_subject: null,
  device_compatibility:
    '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
  course_version_path: '/s/course',
  is_translated: true,
  description: null,
  professional_learning_program: null,
  video: null,
  published_date: null,
  self_paced_pl_course_offering_path: null,
};

const course3Curriculum = {
  key: 'course3',
  display_name: 'Course 3',
  display_name_with_latest_year: 'Course 3 (2012)',
  grade_levels: '3,4,5',
  image: 'course3.png',
  duration: 'lesson',
  cs_topic: 'programming',
  school_subject: null,
  device_compatibility:
    '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
  course_version_path: '/s/course',
  is_translated: true,
  description: null,
  professional_learning_program: null,
  video: null,
  published_date: null,
  self_paced_pl_course_offering_path: null,
};

const course4Curriculum = {
  key: 'course4',
  display_name: 'Course 4',
  display_name_with_latest_year: 'Course 4 (2012)',
  grade_levels: '4,5',
  image: 'course4.png',
  duration: 'lesson',
  cs_topic: 'programming',
  school_subject: null,
  device_compatibility:
    '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
  course_version_path: '/s/course',
  is_translated: true,
  description: null,
  professional_learning_program: null,
  video: null,
  published_date: null,
  self_paced_pl_course_offering_path: null,
};

const noGradesCurriculum = {
  key: 'no-grades',
  display_name: 'No Grades',
  display_name_with_latest_year: 'No Grade (2012)',
  grade_levels: null,
  image: 'grades.png',
  duration: 'lesson',
  cs_topic: 'programming',
  school_subject: 'math',
  device_compatibility:
    '{"computer":"not_recommended","chromebook":"not_recommended","tablet":"not_recommended","mobile":"not_recommended","no_device":"incompatible"}',
  course_version_path: '/s/course',
  is_translated: false,
  description: null,
  professional_learning_program: null,
  video: null,
  published_date: null,
  self_paced_pl_course_offering_path: null,
};

const noPathCurriculum = {
  key: 'no-path',
  display_name: 'No Path',
  display_name_with_latest_year: 'No Path (2012)',
  grade_levels: 'K,1',
  image: 'grades.png',
  duration: 'month',
  cs_topic: 'programming',
  school_subject: 'math',
  device_compatibility:
    '{"computer":"not_recommended","chromebook":"not_recommended","tablet":"not_recommended","mobile":"not_recommended","no_device":"incompatible"}',
  course_version_path: null,
  is_translated: false,
  description: null,
  professional_learning_program: null,
  video: null,
  published_date: null,
  self_paced_pl_course_offering_path: null,
};

// Curricula groups
const allCurricula = [
  makerCurriculum,
  countingCurriculum,
  poemArtCurriculum,
  danceUnpluggedCurriculum,
  course1Curriculum,
  course2Curriculum,
  course3Curriculum,
  course4Curriculum,
  noGradesCurriculum,
  noPathCurriculum,
];

const allShownCurricula = [
  makerCurriculum,
  countingCurriculum,
  poemArtCurriculum,
  danceUnpluggedCurriculum,
  course1Curriculum,
  course2Curriculum,
  course3Curriculum,
  course4Curriculum,
];

const gradesKAnd2ShownCurricula = [
  poemArtCurriculum,
  danceUnpluggedCurriculum,
  course1Curriculum,
  course2Curriculum,
];

const weeklongShownCurricula = [makerCurriculum];

const physicalCompShownCurricula = [makerCurriculum];

const nonNullSchoolSubjectShownCurricula = [
  countingCurriculum,
  poemArtCurriculum,
];

const tabletAndNoDeviceShownCurricula = [
  poemArtCurriculum,
  danceUnpluggedCurriculum,
  course1Curriculum,
  course2Curriculum,
  course3Curriculum,
  course4Curriculum,
];

const translatedCurricula = [
  course1Curriculum,
  course2Curriculum,
  course3Curriculum,
  course4Curriculum,
];

// Filters for grades 2 or 3, physical computing or interdisciplinary, and tablet or no device curricula.
const multipleFiltersAppliedShownCurricula = [poemArtCurriculum];

// If every filter is applied, only curricula that have null for the properties associated with the filters
// will be filtered out.
const allFiltersAppliedShownCurricula = [
  countingCurriculum,
  poemArtCurriculum,
  danceUnpluggedCurriculum,
  course1Curriculum,
  course2Curriculum,
  course3Curriculum,
  course4Curriculum,
];

export default {
  allCurricula,
  allShownCurricula,
  gradesKAnd2ShownCurricula,
  weeklongShownCurricula,
  physicalCompShownCurricula,
  nonNullSchoolSubjectShownCurricula,
  tabletAndNoDeviceShownCurricula,
  translatedCurricula,
  multipleFiltersAppliedShownCurricula,
  allFiltersAppliedShownCurricula,
  noGradesCurriculum,
  noPathCurriculum,
};
