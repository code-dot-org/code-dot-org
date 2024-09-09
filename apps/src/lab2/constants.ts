import {AppName} from './types';

export const SOURCE_FILE = 'main.json';

export const BLOCKLY_LABS: AppName[] = [
  'dance',
  'flappy',
  'music',
  'thebadguys',
  'turtle',
  'craft',
  'studio',
  'bounce',
  'poetry',
  'spritelab',
];

export const LABS_WITH_JSON_SOURCES: AppName[] = ['aichat'];

export const MAIN_PYTHON_FILE = 'main.py';

export enum PERMISSIONS {
  // Add more permissions as needed.
  LEVELBUILDER = 'levelbuilder',
  PROJECT_VALIDATOR = 'project_validator',
}

export const START_SOURCES = 'start_sources';

export const LABS_USING_NEW_SHARE_DIALOG = ['music', 'pythonlab'];

// Text-based labs that are currently supported by lab2.
export const TEXT_BASED_LABS: AppName[] = ['aichat', 'pythonlab', 'weblab2'];

// Banner messages to show LevelBuilders when in start mode. These don't need to be tranlsated because LevelBuilder is English only.
export enum WARNING_BANNER_MESSAGES {
  STANDARD = 'You are editing start sources.',
  TEMPLATE = 'WARNING: You are editing start sources for a level with a template. Start sources should be defined on the template.',
}
