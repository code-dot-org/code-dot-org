import Toggle from '@code-dot-org/component-library/toggle';
import {Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';

import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';

import moduleStyles from './edit-ai-tutor-prompt-settings.module.scss';

interface PromptSettings {
  answerTypes?: string[];
  answerTypeCustomizations?: Record<string, string>;
  disableCommitMessages?: boolean;
}

interface EditAiTutorPromptSettingsProps {
  promptSettings?: PromptSettings;
  toggleableAnswerTypes: string[];
  answerTypeToLabel: Record<string, string>;
  answerTypeContracts: Record<string, string>;
  defaultAnswerTypes: string[];
  legacyMode?: string;
  legacyModeToAnswerType?: Record<string, string[]>;
  instructions?: string;
  /** Only labs whose tutor proposes file changes for the student to accept. */
  showCommitMessagesToggle?: boolean;
}

const DEFAULT_INSTRUCTIONS =
  'Choose which answer types you would like the AI tutor to be able to respond with. You must specify at least one.';

const EditAiTutorPromptSettings: React.FC<EditAiTutorPromptSettingsProps> = ({
  promptSettings,
  toggleableAnswerTypes,
  answerTypeToLabel,
  answerTypeContracts,
  defaultAnswerTypes,
  legacyMode,
  legacyModeToAnswerType,
  instructions = DEFAULT_INSTRUCTIONS,
  showCommitMessagesToggle = false,
}) => {
  const [enabledAnswerTypes, setEnabledAnswerTypes] = useState<Set<string>>(
    () => {
      if (promptSettings?.answerTypes !== undefined) {
        return new Set(promptSettings.answerTypes);
      } else if (legacyMode && legacyModeToAnswerType?.[legacyMode]) {
        return new Set(legacyModeToAnswerType[legacyMode]);
      }
      return new Set(defaultAnswerTypes);
    }
  );

  const [answerTypeCustomizations, setAnswerTypeCustomizations] = useState<
    Record<string, string>
  >(promptSettings?.answerTypeCustomizations ?? {});

  const [disableCommitMessages, setDisableCommitMessages] = useState(
    promptSettings?.disableCommitMessages ?? false
  );

  const handleToggle = (answerType: string, checked: boolean) => {
    setEnabledAnswerTypes(prev => {
      const updated = new Set(prev);
      if (checked) {
        updated.add(answerType);
      } else {
        updated.delete(answerType);
      }
      return updated;
    });
  };

  const handleEnableAll = () => {
    setEnabledAnswerTypes(new Set(toggleableAnswerTypes));
  };

  const handleDisableAll = () => {
    setEnabledAnswerTypes(new Set());
  };

  const handleCustomizationChange = (answerType: string, value: string) => {
    setAnswerTypeCustomizations(prev => ({
      ...prev,
      [answerType]: value,
    }));
  };

  return (
    <div>
      <input
        id="level_ai_tutor_prompt_settings"
        type="hidden"
        value={JSON.stringify({
          answerTypes: Array.from(enabledAnswerTypes),
          answerTypeCustomizations: answerTypeCustomizations,
          // Omitted unless true, so levels that never set it serialize unchanged.
          disableCommitMessages: disableCommitMessages || undefined,
        })}
        name={'level[ai_tutor_prompt_settings]'}
      />
      <div className={moduleStyles.bulkActionButtons}>
        <MuiButton variant="outlined" size="small" onClick={handleEnableAll}>
          Enable All
        </MuiButton>
        <MuiButton
          variant="outlined"
          size="small"
          disabled={enabledAnswerTypes.size === 0}
          onClick={handleDisableAll}
        >
          Disable All
        </MuiButton>
      </div>
      <div className={moduleStyles.togglesContainer}>
        {toggleableAnswerTypes.map(answerType => (
          <div key={answerType}>
            <Toggle
              name={answerType}
              label={answerTypeToLabel[answerType]}
              checked={enabledAnswerTypes.has(answerType)}
              onChange={e => handleToggle(answerType, e.target.checked)}
            />
            <details className={moduleStyles.contractDetails}>
              <summary className={moduleStyles.contractSummary}>
                View/add to contract
              </summary>
              <div className={moduleStyles.contractContent}>
                <EnhancedSafeMarkdown
                  markdown={answerTypeContracts[answerType]}
                />
              </div>
              <textarea
                className={moduleStyles.customizationTextarea}
                disabled={!enabledAnswerTypes.has(answerType)}
                placeholder="Add to contract (optional). Write additional instructions in markdown."
                value={answerTypeCustomizations[answerType] ?? ''}
                onChange={e =>
                  handleCustomizationChange(answerType, e.target.value)
                }
              />
            </details>
          </div>
        ))}
      </div>
      {showCommitMessagesToggle && (
        <div className={moduleStyles.commitMessagesToggle}>
          <Toggle
            name="enableCommitMessages"
            label="Enable commit messages (recommended): accepting AI Tutor changes will prompt for a commit message"
            checked={!disableCommitMessages}
            // The toggle reads as "enable", so its checked state is the inverse.
            onChange={e => setDisableCommitMessages(!e.target.checked)}
          />
        </div>
      )}
    </div>
  );
};

export default EditAiTutorPromptSettings;
