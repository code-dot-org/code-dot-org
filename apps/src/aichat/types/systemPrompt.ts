import {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';

// Types used to customize the system prompt.
export interface SystemPromptSettings {
  systemPromptOptions: SystemPromptOption[];
  selectedSystemPromptName: string;
  onSystemPromptChange: (promptName: string) => void;
}

export interface SystemPromptOption {
  displayName: string;
  icon: FontAwesomeV6IconProps;
  promptName: string;
}
