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
};

export type ChatButtonComponent = React.ComponentType<ChatButtonProps>;

export interface ChatButtonAndKey {
  ChatButton: ChatButtonComponent;
  key: string;
}
