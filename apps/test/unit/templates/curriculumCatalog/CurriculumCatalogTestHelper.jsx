// Individual curricula definitions
const makerCurriculum = {
  key: 'devices',
  display_name: 'Creating Apps for Devices',
  grade_levels: '6,7,8,9,10,11,12',
  image: 'devices.png',
  duration: 'week',
  cs_topic: 'art_and_design,app_design,physical_computing,programming',
  school_subject: null,
  course_version_path: '/s/course',
};

const countingCurriculum = {
  key: 'counting-csc',
  display_name: 'Computer Science Connections',
  grade_levels: '3,4,5',
  image: 'csc.png',
  duration: 'lesson',
  cs_topic: 'programming',
  school_subject: 'math',
  device_compatibility:
    '{"computer":"ideal","chromebook":"ideal","tablet":"not_recommended","mobile":"not_recommended","no_device":"incompatible"}',
  course_version_path: '/s/course',
};

const poemArtCurriculum = {
  key: 'poem-art',
  display_name: 'Poem Art',
  grade_levels: '2,3,4,5,6,7,8,9,10,11,12',
  image: null,
  duration: 'lesson',
  cs_topic: 'art_and_design,games_and_animations,programming',
  school_subject: 'english_language_arts',
  device_compatibility:
    '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
  course_version_path: '/s/course',
};

const danceUnpluggedCurriculum = {
  key: 'dance-unplugged',
  display_name: 'Hour of Code - Dance Party - Unplugged',
  grade_levels: '2,3,4,5,6,7,8',
  image: null,
  duration: 'lesson',
  cs_topic: 'data,programming',
  school_subject: null,
  device_compatibility:
    '{"computer":"incompatible","chromebook":"incompatible","tablet":"incompatible","mobile":"incompatible","no_device":"ideal"}',
  course_version_path: '/s/course',
};

const course1Curriculum = {
  key: 'course1',
  display_name: 'Course 1',
  grade_levels: 'K,1',
  image: null,
  duration: 'lesson',
  cs_topic: 'programming',
  school_subject: null,
  device_compatibility:
    '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
  course_version_path: '/s/course',
};

const course2Curriculum = {
  key: 'course2',
  display_name: 'Course 2',
  grade_levels: '2,3,4,5',
  image: 'course2.png',
  duration: 'lesson',
  cs_topic: 'programming',
  school_subject: null,
  device_compatibility:
    '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
  course_version_path: '/s/course',
};

const course3Curriculum = {
  key: 'course3',
  display_name: 'Course 3',
  grade_levels: '3,4,5',
  image: 'course3.png',
  duration: 'lesson',
  cs_topic: 'programming',
  school_subject: null,
  device_compatibility:
    '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
  course_version_path: '/s/course',
};

const course4Curriculum = {
  key: 'course4',
  display_name: 'Course 4',
  grade_levels: '4,5',
  image: 'course4.png',
  duration: 'lesson',
  cs_topic: 'programming',
  school_subject: null,
  device_compatibility:
    '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
  course_version_path: '/s/course',
};

const noGradesCurriculum = {
  key: 'no-grades',
  display_name: 'No Grades',
  grade_levels: null,
  image: 'grades.png',
  duration: 'lesson',
  cs_topic: 'programming',
  school_subject: 'math',
  device_compatibility:
    '{"computer":"not_recommended","chromebook":"not_recommended","tablet":"not_recommended","mobile":"not_recommended","no_device":"incompatible"}',
  course_version_path: '/s/course',
};

const noPathCurriculum = {
  key: 'no-path',
  display_name: 'No Path',
  grade_levels: 'K,1',
  image: 'grades.png',
  duration: 'month',
  cs_topic: 'programming',
  school_subject: 'math',
  device_compatibility:
    '{"computer":"not_recommended","chromebook":"not_recommended","tablet":"not_recommended","mobile":"not_recommended","no_device":"incompatible"}',
  course_version_path: null,
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

const grades2And3ShownCurricula = [
  countingCurriculum,
  poemArtCurriculum,
  danceUnpluggedCurriculum,
  course2Curriculum,
  course3Curriculum,
];

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
  grades2And3ShownCurricula,
  physicalCompShownCurricula,
  nonNullSchoolSubjectShownCurricula,
  tabletAndNoDeviceShownCurricula,
  multipleFiltersAppliedShownCurricula,
  allFiltersAppliedShownCurricula,
  noGradesCurriculum,
  noPathCurriculum,
};
