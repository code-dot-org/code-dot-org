import {IconDropdown} from '@code-dot-org/component-library/dropdown';
import React, {useMemo} from 'react';

import {SystemPromptSettings} from '../types';

interface ChatModeDropdownProps {
  systemPromptSettings?: SystemPromptSettings;
  className?: string;
}

const ChatModeDropdown: React.FunctionComponent<ChatModeDropdownProps> = ({
  systemPromptSettings,
  className,
}) => {
  // availableModes and selectedMode are used for the system prompt dropdown (if provided).
  // systemPromptSettings is provided in a display-agnostic way, so we convert it here to the
  // format needed by IconDropdown.
  const availableModes = useMemo(() => {
    if (!systemPromptSettings?.systemPromptOptions) {
      return undefined;
    }
    return systemPromptSettings.systemPromptOptions.map(option => ({
      value: option.promptName,
      label: option.displayName,
      icon: option.icon,
    }));
  }, [systemPromptSettings?.systemPromptOptions]);

  const selectedMode = useMemo(() => {
    if (!systemPromptSettings?.selectedSystemPromptName) {
      return undefined;
    } else {
      const settingsForPrompt = systemPromptSettings.systemPromptOptions.find(
        option =>
          option.promptName === systemPromptSettings.selectedSystemPromptName
      );
      if (!settingsForPrompt) {
        return undefined;
      }
      return {
        value: systemPromptSettings.selectedSystemPromptName,
        label: settingsForPrompt?.displayName,
        icon: settingsForPrompt?.icon,
      };
    }
  }, [
    systemPromptSettings?.selectedSystemPromptName,
    systemPromptSettings?.systemPromptOptions,
  ]);

  return availableModes && selectedMode ? (
    <IconDropdown
      onChange={option =>
        systemPromptSettings?.onSystemPromptChange(option.value)
      }
      name={'chat-change-mode'}
      options={availableModes}
      selectedOption={selectedMode}
      labelText={selectedMode.label}
      size="xs"
      className={className}
      readOnly={availableModes.length <= 1}
    />
  ) : null;
};

export default ChatModeDropdown;
