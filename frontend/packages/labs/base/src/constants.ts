import {AppName} from '@code-dot-org/projects';

export const TEACHER_FEEDBACK_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLSflGeMmY_ff1QllJfpTsWGZdn_xv6dKpPba_evTMwfbvG3FTA/viewform';
export const STUDENT_FEEDBACK_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLSeZGNgX4wDvA29stId_Q2toofJN-r12zSP8yBMZ-E9KW5XPWg/viewform';

export const SOURCE_FILE = 'main.json';

export const BLOCKLY_LABS: AppName[] = ['dance', 'music'];

export const LABS_WITH_JSON_SOURCES: AppName[] = ['aichat'];

export const MAIN_PYTHON_FILE = 'main.py';

export enum PERMISSIONS {
  // Add more permissions as needed.
  LEVELBUILDER = 'levelbuilder',
  PROJECT_VALIDATOR = 'project_validator',
}

export const START_SOURCES = 'start_sources';
export const TOOLBOX_BLOCKS = 'toolbox_blocks';
export const EDIT_EXEMPLAR = 'edit_exemplar';

export const LABS_USING_NEW_SHARE_DIALOG = ['music', 'pythonlab'];

// Text-based labs that are currently supported by lab2.
export const TEXT_BASED_LABS: AppName[] = ['aichat', 'pythonlab', 'weblab2'];

// Banner messages to show LevelBuilders when in start mode. These don't need to be translated because LevelBuilder is English only.
export enum WARNING_BANNER_MESSAGES {
  STANDARD = 'You are editing start sources.',
  TEMPLATE = 'WARNING: You are editing start sources for a level with a template. Start sources should be defined on the template.',
  LOCK_FILES = 'Reminder: lock all start files your validation file references.',
  TOOLBOX_MODE = 'You are editing toolbox blocks.',
  EXEMPLAR_MODE = 'You are editing exemplar sources.',
  VIEWING_EXEMPLAR = 'You are viewing an example solution.',
}

// Default height of the predict question free response text area.
export const PREDICT_FREE_RESPONSE_DEFAULT_HEIGHT = 50;

export enum FontSize {
  Tiny = 10,
  Small = 13, // Default font size
  Medium = 17,
  Large = 22,
  Huge = 27,
}

export const ProjectSubmissionStatus = {
  CAN_SUBMIT: "can_submit",
  ALREADY_SUBMITTED: "already_submitted",
  PROJECT_TYPE_NOT_ALLOWED: "project_type_not_allowed",
  RESTRICTED_SHARE_MODE: "restricted_share_mode",
  SHARING_DISABLED: "sharing_disabled",
  OWNER_TOO_NEW: "owner_too_new",
  PROJECT_TOO_NEW: "project_too_new"
} as const;

export const FeaturedProjectStatus = {
  active: 'active',
  bookmarked: 'bookmarked',
  archived: 'archived',
} as const;
