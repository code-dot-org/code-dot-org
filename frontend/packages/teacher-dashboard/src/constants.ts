export const PublishedState = {
  in_development: 'in_development',
  pilot: 'pilot',
  beta: 'beta',
  preview: 'preview',
  stable: 'stable',
  sunsetting: 'sunsetting',
  deprecated: 'deprecated',
};

export const InstructionType = {
  teacher_led: 'teacher_led',
  self_paced: 'self_paced',
};

export const ParticipantAudience = {
  facilitator: 'facilitator',
  teacher: 'teacher',
  student: 'student',
};

export const InstructorAudience = {
  universal_instructor: 'universal_instructor',
  plc_reviewer: 'plc_reviewer',
  facilitator: 'facilitator',
  teacher: 'teacher',
};

export const CurriculumUmbrella = {
  CSF: 'CSF',
  CSD: 'CSD',
  CSP: 'CSP',
  CSA: 'CSA',
  HOC: 'HOC',
  foundations_of_cs: 'AIF',
  foundations_of_programming: 'Foundations of Programming',
  CSC_K_5: 'CSC K-5',
  CSC_6_8: 'CSC 6-8',
  CSC_9_12: 'CSC 9-12',
  special_topics_k_5: 'K-5 Special topics',
  special_topics_6_8: '6-8 Special topics',
  special_topics_9_12: '9-12 Special topics',
  pd_for_facilitators: 'PD for Facilitators',
  pd_workshop_activity_csf: 'PD Workshop Activity CSF',
  pd_workshop_activity_csd: 'PD Workshop Activity CSD',
  pd_workshop_activity_csp: 'PD Workshop Activity CSP',
  pd_workshop_activity_csa: 'PD Workshop Activity CSA',
  CSA_self_paced_pl: 'Self-paced PL - CSA',
  CSP_self_paced_pl: 'Self-paced PL - CSP',
  CSD_self_paced_pl: 'Self-paced PL - CSD',
  CSF_self_paced_pl: 'Self-paced PL - CSF',
  CSC_k_5_self_paced_pl: 'Self-paced PL - CSC K-5',
  foundations_of_cs_selfpaced_pl: 'Self-paced PL - AIF',
  ai_for_teachers_selfpaced_pl: 'Self-paced PL - AI for teachers',
  special_topics_curriculum_selfpaced_pl_k_5:
    'Self-paced PL - K-5 special topics',
  special_topics_curriculum_selfpaced_pl_6_8:
    'Self-paced PL - 6-8 special topics',
  special_topics_curriculum_selfpaced_pl_9_12:
    'Self-paced PL - 9-12 special topics',
  pedagogy_special_topics_selfpaced_pl:
    'Self-paced PL - Pedagogy special topics',
  cs_basics_selfpaced_pl: 'Self-paced PL - CS Basics',
  other: 'Other',
};

export const CurriculumTopicTags = {
  ai: 'AI',
  maker: 'Maker',
  music_lab: 'Music lab',
  survey: 'Survey',
  data_science: 'Data Science',
};

export const CurriculumContentArea = {
  curriculum_k_5: 'K-5 Curriculum',
  curriculum_6_8: '6-8 Curriculum',
  curriculum_9_12: '9-12 Curriculum',
  hoc: 'HOC',
  pl_workshop_activities: 'PL Workshop activities',
  self_paced_pl_k_5: 'K-5 self-paced PL',
  self_paced_pl_6_8: '6-8 self-paced PL',
  self_paced_pl_9_12: '9-12 self-paced PL',
  skills_focused_self_paced_pl: 'Skills-focused self-paced PL',
  pd_for_facilitators: 'PD for Facilitators',
  other: 'Other',
};

export const CourseOfferingCurriculumTypes = {
  module: 'Module',
  course: 'Course',
  standalone_unit: 'Standalone Unit',
  hoc: 'Hour of Code',
  pl: 'Professional Learning',
};

export const CourseOfferingHeaders = {
  favorites: 'Favorites',
  labs_and_skills: 'Labs and Skills',
  minecraft: 'Minecraft',
  hello_world: 'Hello World',
  popular_media: 'Popular Media',
  sports: 'Sports',
  express: 'Express',
  csf: 'CS Fundamentals',
  csc: 'CS Connections',
  year_long: 'Year Long',
  csa_labs: 'CSA Labs',
  self_paced: 'Self-Paced',
  teacher_led: 'Teacher-Led',
  collections: 'Collections',
  workshops_k5: 'K-5 Workshops',
  summer_workshops_612: '6-12 Summer Workshops',
  virtual_academic_year_workshops_612: '6–12 Virtual Academic Year Workshops',
  unsupported: 'Unsupported',
};

export const CourseOfferingMarketingInitiatives = {
  hoc: 'HOC',
  csc: 'CSC',
  csf: 'CSF',
  csa: 'CSA',
  csp: 'CSP',
  csd: 'CSD',
  aif: 'AIF',
};

export const CourseOfferingCsTopics = [
  'art_and_design',
  'app_design',
  'artificial_intelligence',
  'cybersecurity',
  'data',
  'digital_literacy',
  'games_and_animations',
  'internet',
  'physical_computing',
  'web_design',
  'programming',
];

export const CourseOfferingSchoolSubjects = [
  'math',
  'science',
  'english_language_arts',
  'history',
];

export const DeviceTypes = [
  'computer',
  'chromebook',
  'tablet',
  'mobile',
  'no_device',
];

export const DeviceCompatibilityLevels = [
  'ideal',
  'not_recommended',
  'incompatible',
];

export const ParticipantAudiencesByType = {
  student: ['student'],
  teacher: ['student', 'teacher'],
  facilitator: ['student', 'teacher', 'facilitator'],
};
