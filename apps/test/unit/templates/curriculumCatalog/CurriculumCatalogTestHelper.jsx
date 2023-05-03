// Individual curricula definitions
const makerCurriculum = {
  key: 'devices',
  display_name: 'Creating Apps for Devices',
  grade_levels: '6,7,8,9,10,11,12',
  image: 'devices.png',
  cs_topic: 'art_and_design,app_design,physical_computing,programming',
  school_subject: null,
};

const countingCurriculum = {
  key: 'counting-csc',
  display_name: 'Computer Science Connections',
  grade_levels: '3,4,5',
  image: 'csc.png',
  cs_topic: 'programming',
  school_subject: 'math',
  device_compatibility:
    '{"computer":"ideal","chromebook":"ideal","tablet":"not_recommended","mobile":"not_recommended","no_device":"incompatible"}',
};

const poemArtCurriculum = {
  key: 'poem-art',
  display_name: 'Poem Art',
  grade_levels: '2,3,4,5,6,7,8,9,10,11,12',
  image: null,
  cs_topic: 'art_and_design,games_and_animations,programming',
  school_subject: 'english_language_arts',
  device_compatibility:
    '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
};

const danceUnpluggedCurriculum = {
  key: 'dance-unplugged',
  display_name: 'Hour of Code - Dance Party - Unplugged',
  grade_levels: '2,3,4,5,6,7,8',
  image: null,
  cs_topic: 'data,programming',
  school_subject: null,
  device_compatibility:
    '{"computer":"incompatible","chromebook":"incompatible","tablet":"incompatible","mobile":"incompatible","no_device":"ideal"}',
};

const course1Curriculum = {
  key: 'course1',
  display_name: 'Course 1',
  grade_levels: 'K,1',
  image: null,
  cs_topic: 'programming',
  school_subject: null,
  device_compatibility:
    '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
};

const course2Curriculum = {
  key: 'course2',
  display_name: 'Course 2',
  grade_levels: '2,3,4,5',
  image: 'course2.png',
  cs_topic: 'programming',
  school_subject: null,
  device_compatibility:
    '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
};

const course3Curriculum = {
  key: 'course3',
  display_name: 'Course 3',
  grade_levels: '3,4,5',
  image: 'course3.png',
  cs_topic: 'programming',
  school_subject: null,
  device_compatibility:
    '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
};

const course4Curriculum = {
  key: 'course4',
  display_name: 'Course 4',
  grade_levels: '4,5',
  image: 'course4.png',
  cs_topic: 'programming',
  school_subject: null,
  device_compatibility:
    '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
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
];

const grades2And3Curricula = [
  countingCurriculum,
  poemArtCurriculum,
  danceUnpluggedCurriculum,
  course2Curriculum,
  course3Curriculum,
];

const physicalCompCurricula = [makerCurriculum];

const nonNullSchoolSubjectCurricula = [countingCurriculum, poemArtCurriculum];

const tabletAndNoDeviceCurricula = [
  poemArtCurriculum,
  danceUnpluggedCurriculum,
  course1Curriculum,
  course2Curriculum,
  course3Curriculum,
  course4Curriculum,
];

export default {
  allCurricula,
  grades2And3Curricula,
  physicalCompCurricula,
  nonNullSchoolSubjectCurricula,
  tabletAndNoDeviceCurricula,
};
