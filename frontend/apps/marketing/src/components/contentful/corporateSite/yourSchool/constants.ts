import type {YourSchoolFormData} from './types';

export const YOUR_SCHOOL_FORM_ID = 'form';

export const YOUR_SCHOOL_ROLES = {
  '': '',
  Teacher: 'TEACHER',
  Administrator: 'ADMINISTRATOR',
  Parent: 'PARENT',
  Volunteer: 'VOLUNTEER',
  Other: 'OTHER',
};

export const YOUR_SCHOOL_QUANTITIES = {
  '': '',
  None: 'NONE',
  Some: 'SOME',
  All: 'ALL',
  "I don't know": "I DON'T KNOW",
};

export const YOUR_SCHOOL_FREQUENCIES = {
  '': '',
  '< 1 hour per week': 'LESS THAN ONE HOUR PER WEEK',
  '1-3 hours per week': 'ONE TO THREE HOURS PER WEEK',
  '3+ hours per week': 'THREE PLUS HOURS PER WEEK',
  "I don't know": "I DON'T KNOW",
};

export const YOUR_SCHOOL_COURSE_TOPICS = {
  topic_blocks: 'Block-based programming',
  topic_text: 'Text-based programming (not HTML or CSS)',
  topic_robots: 'Robotics / Physical computing',
  topic_internet: 'Internet and networking',
  topic_security: 'Cybersecurity',
  topic_data: 'Data analysis',
  topic_web_design: ' Web design using HTML or CSS',
  topic_game_design: 'Game design (no-code)',
  topic_ethical_social: 'Ethical and social issues in computing',
};

export const YOUR_SCHOOL_DEFAULT_FORM_DATA: YourSchoolFormData = {
  nces_school_s: '',
  submitter_email_address: '',
  submitter_name: '',
  submitter_role: '',
  how_many_do_hoc: '',
  how_many_after_school: '',
  how_many_10_hours: '',
  how_many_20_hours: '',
  topic_blocks: false,
  topic_text: false,
  topic_robots: false,
  topic_internet: false,
  topic_security: false,
  topic_data: false,
  topic_web_design: false,
  topic_game_design: false,
  topic_ethical_social: false,
  topic_do_not_know: false,
  topic_other: false,
  topic_other_description: '',
  class_frequency: '',
  tell_us_more: '',
  other_classes_under_20_hours: false,
  share_with_regional_partners: false,
  opt_in: false,
};
