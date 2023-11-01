// Analytics constants used within the apps directory.
// (See pegasus/helpers/analytics_constants.rb for constants in the
// pegasus directory)
const EVENTS = {
  // Sign-up flow
  ACCOUNT_TYPE_PICKED_EVENT: 'Account Type Picked',
  SIGN_UP_STARTED_EVENT: 'Sign Up Started',
  SIGN_UP_LOGIN_TYPE_PICKED_EVENT: 'User Login Type Picked',
  SIGN_UP_FINISHED_EVENT: 'Sign Up Finished',
  SECTION_SETUP_SIGN_IN_EVENT: 'Section Setup Sign In',
  ABANDON_SECTION_SETUP_SIGN_IN_EVENT: 'Abandon Section Setup Sign In',
  TEACHER_LOGIN_EVENT: 'Teacher Login',

  // Course/Unit info
  COURSE_OVERVIEW_PAGE_VISITED_BY_TEACHER_EVENT:
    'Course Overview Page Visited By Teacher',
  UNIT_OVERVIEW_PAGE_VISITED_BY_TEACHER_EVENT:
    'Unit Overview Page Visited By Teacher',
  TRY_NOW_BUTTON_CLICK_EVENT: 'Try Now Button Clicked',

  // Lesson info
  LESSON_OVERVIEW_PAGE_VISITED_EVENT: 'Lesson Overview Page Visited',
  LESSON_RESOURCE_LINK_VISITED_EVENT: 'Lesson Resource Link Visited',

  // Workshop enrollment
  WORKSHOP_ENROLLMENT_COMPLETED_EVENT: 'Workshop Enrollment Completed',

  // PD Application flow
  TEACHER_APP_VISITED_EVENT: '6-12 Teacher Application Visited',
  PAGE_CHANGED_EVENT: 'Page Changed',
  PROGRAM_PICKED_EVENT: 'Professional Learning Program Picked',
  SCHOOL_ID_CHANGED_EVENT: 'School ID Changed',
  RP_FOUND_EVENT: 'Regional Partner Found',
  APPLICATION_SAVED_EVENT: 'Application Saved',
  APPLICATION_SUBMITTED_EVENT: 'Application Submitted',
  APP_STATUS_CHANGE_EVENT: 'Application Status Changed',
  ADMIN_APPROVAL_RECEIVED_EVENT: 'Administrator Approval Received',
  SUBMIT_RP_CONTACT_FORM_EVENT: 'Submit Regional Partner Contact Form',

  // Marketing site pages
  ADMIN_INTEREST_FORM_SUBMIT_EVENT: 'Administrator Interest Form Submitted',

  // Sections
  COMPLETED_EVENT: 'Section Setup Completed',
  CURRICULUM_ASSIGNED: 'Section Curriculum Assigned',
  PROGRESS_VIEWED: 'Section Progress Viewed',
  PROGRESS_TOGGLE: 'Section Progress Toggled',
  PROGRESS_CHANGE_UNIT: 'Section Progress Unit Changed',
  PROGRESS_JUMP_TO_LESSON: 'Section Progress Jump to Lesson',
  SORT_BY_FAMILY_NAME: 'Sorted by family name',
  SORT_BY_DISPLAY_NAME: 'Sorted by display name',

  // Levels
  FEEDBACK_SUBMITTED: 'Level Feedback Submitted',
  RUBRIC_LEVEL_VIEWED_EVENT: 'Rubric Level Viewed',
  TEACHER_VIEWING_STUDENT_WORK: 'Teacher Viewing Student Work',
  SUMMARY_PAGE_LOADED: 'Summary Page Loaded',
  SUMMARY_PAGE_NEXT_LEVEL_CLICKED: 'Summary Page Next Level Clicked',
  SUMMARY_PAGE_BACK_TO_LEVEL_CLICKED: 'Summary Page Back To Level Clicked',

  // Maker setup
  MAKER_SETUP_PAGE_BOARD_TYPE_EVENT: 'Board Type On Maker Setup Page',
  MAKER_SETUP_PAGE_MB_VERSION_EVENT: 'Microbit Version',
  MAKER_SETUP_PAGE_MB_UPDATE_ERROR_EVENT: 'Microbit Software Update Error',

  // Curriculum Catalog page
  CURRICULUM_CATALOG_VISITED_EVENT: 'Curriculum Catalog Visited',
  CURRICULUM_CATALOG_ASSIGN_CLICKED_EVENT: 'Assign Clicked',
  CURRICULUM_CATALOG_SIGN_IN_CLICKED_IN_ASSIGN_DIALOG:
    'Sign In Or Create Account Clicked In Assign Dialog',
  CURRICULUM_CATALOG_ASSIGN_COMPLETED_EVENT:
    'Course Offering Assignment Completed',
  CURRICULUM_CATALOG_DROPDOWN_FILTER_SELECTED_EVENT: 'Filter Selected',
  CURRICULUM_CATALOG_TOGGLE_LANGUAGE_FILTER_EVENT:
    'Show Only Translated Curriculums Toggled',
  CURRICULUM_CATALOG_NO_AVAILABLE_CURRICULA_EVENT:
    'No Available Curriculums Message Shown',
  CURRICULUM_CATALOG_QUICK_VIEW_CLICKED_EVENT: 'Quick View Clicked',

  // Rubrics
  TA_RUBRIC_OPENED_FROM_FAB_EVENT: 'TA Rubric Opened From FAB',
  TA_RUBRIC_CLOSED_FROM_FAB_EVENT: 'TA Rubric Closed From FAB',
  TA_RUBRIC_LEARNING_GOAL_EXPANDED_EVENT: 'TA Rubric Learning Goal Expanded',
  TA_RUBRIC_LEARNING_GOAL_COLLAPSED_EVENT: 'TA Rubric Learning Goal Collapsed',
  TA_RUBRIC_ON_STUDENT_WORK_LOADED: 'TA Rubric On Student Work Loaded',
  TA_RUBRIC_ON_STUDENT_WORK_UNLOADED: 'TA Rubric On Student Work Unloaded',
  TA_RUBRIC_SUBMITTED: 'TA Rubric Submitted',
  TA_RUBRIC_EVIDENCE_LEVEL_SELECTED: 'TA Rubric Evidence Level Selected',
  TA_RUBRIC_RUN_BUTTON_CLICKED:
    'TA Rubric Teacher clicked RUN button on student work',

  // Hour of Code
  AGE_21_SELECTED_EVENT: 'Age 21+ Selected',
  GUIDE_SENT_EVENT: 'Guide Sent',

  // Hour of Code - Dance Party
  DANCE_PARTY_ACTIVITY_STARTED: 'Dance Party Activity Started',
  DANCE_PARTY_LEVEL_COMPLETED: 'Dance Party Level Completed',
  DANCE_PARTY_AI_BACKGROUND_GENERATED: 'Dance Party AI Background Generated',
  DANCE_PARTY_AI_BACKGROUND_REGENERATED:
    'Dance Party AI Background Regenerated',
  DANCE_PARTY_AI_BACKGROUND_USED: 'Dance Party AI Background Used',
  DANCE_PARTY_AI_BACKGROUND_RESTARTED: 'Dance Party AI Background Restarted',
  DANCE_PARTY_AI_BACKGROUND_EDITED: 'Dance Party AI Background Edited',
  DANCE_PARTY_AI_BACKGROUND_EXPLAINED: 'Dance Party AI Background Explained',
  DANCE_PARTY_AI_EMOJI_USED: 'Dance Party AI Emoji Used',
  DANCE_PARTY_VIDEO_PRESENTED: 'Dance Party Video Presented',
  DANCE_PARTY_VIDEO_STARTED: 'Dance Party Video Started',
  DANCE_PARTY_VIDEO_COMPLETED: 'Dance Party Video Completed',

  BATCH_CERTIFICATES_PAGE_VIEWED: 'Batch Certificates Page Viewed',
  TEACHER_HOC_CONGRATS_PAGE_VISITED:
    'Teacher Hour of Code Congrats Page Visited ',
};

export {EVENTS};
