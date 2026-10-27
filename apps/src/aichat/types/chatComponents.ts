import {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {AnalyticsProperties} from './analytics';

// Chat Workspace Types
export enum WorkspaceTeacherViewTab {
  STUDENT_CHAT_HISTORY = 'viewStudentChatHistory',
  TEST_STUDENT_MODEL = 'testStudentModel',
}

// Chat Button Types
export interface ChatButtonData {
  id?: string;
  label: string;
  value: string;
  analyticsProperties?: AnalyticsProperties;
  icon?: FontAwesomeV6IconProps;
}

export type ChatButtonClickHandler = (
  userMessage: string,
  analyticsProperties?: AnalyticsProperties
) => void;

export type ChatButtonProps = {
  onClick: ChatButtonClickHandler;
  disabled?: boolean;
};

export type ChatButtonComponent = React.ComponentType<ChatButtonProps>;

export interface ChatButtonAndKey {
  ChatButton: ChatButtonComponent;
  key: string;
}

// Prompt Mode Types
// A submit button in the message editor. Its message is sent with the mode's
// system prompt, and schema if set, in place of the workspace's own; Enter
// sends with the default mode.
export interface ChatPromptMode {
  value: string;
  label: string;
  icon: Pick<FontAwesomeV6IconProps, 'iconName' | 'iconStyle'>;
  systemPrompt: string;
  responseJsonSchema?: object;
}

export interface ChatPromptModes {
  modes: ChatPromptMode[];
  defaultValue: string;
}
