import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import React, {useEffect, useState} from 'react';

import {networkErrorMessage} from '@cdo/apps/quiz/networkError';

import BuilderCard from './BuilderCard';
import {QuizConfigurationData} from './QuizConfigurationPanel';

import builderCommonStyles from './builder-common.module.scss';

interface IntroScreenCardProps {
  customIntroText: string;
  // Intro screen must be shown when a time limit is set.
  hasTimeLimit: boolean;
  onSave: (fields: Partial<QuizConfigurationData>) => Promise<void>;
}

// The intro screen's markdown content, edited in place at the top of the
// quiz outline. Its title is the quiz display name, set in Configuration.
const IntroScreenCard: React.FunctionComponent<IntroScreenCardProps> = ({
  customIntroText,
  hasTimeLimit,
  onSave,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [draft, setDraft] = useState(customIntroText);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isBusy = isSaving || isRemoving;
  const isDirty = draft !== customIntroText;

  useEffect(() => {
    setDraft(customIntroText);
  }, [customIntroText]);

  const save = async (fields: Partial<QuizConfigurationData>) => {
    setError(null);
    try {
      await onSave(fields);
      return true;
    } catch (e) {
      setError(await networkErrorMessage(e));
      return false;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const ok = await save({customIntroText: draft});
    setIsSaving(false);
    if (ok) {
      setIsExpanded(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    await save({showIntroScreen: false});
    setIsRemoving(false);
  };

  return (
    <BuilderCard
      iconName="hand-wave"
      name="Intro Screen"
      preview={draft}
      itemLabel="intro screen"
      isExpanded={isExpanded}
      onExpandedChange={setIsExpanded}
      isDirty={isDirty}
      isSaving={isSaving}
      isRemoving={isRemoving}
      error={error}
      onSave={handleSave}
      onDiscard={() => setDraft(customIntroText)}
      onRemove={handleRemove}
      cannotRemoveReason={
        hasTimeLimit
          ? 'Remove the time limit in Configuration before removing the intro screen.'
          : undefined
      }
    >
      <div className={builderCommonStyles.section}>
        <FormFieldWrapper label="Content" helperMessage="Supports markdown.">
          <textarea
            className={builderCommonStyles.textarea}
            name="customIntroText"
            rows={6}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            disabled={isBusy}
          />
        </FormFieldWrapper>
      </div>
    </BuilderCard>
  );
};

export default IntroScreenCard;
