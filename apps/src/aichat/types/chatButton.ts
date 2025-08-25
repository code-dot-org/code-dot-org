import {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {AnalyticsProperties} from './analytics';

export interface ChatButtonData {
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
