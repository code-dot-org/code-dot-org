import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import React, {useState} from 'react';

import BuilderCard from './BuilderCard';
import {QuizConfigurationData} from './types';

import builderCommonStyles from './builder-common.module.scss';

interface IntroScreenCardProps {
  customIntroText: string;
  savedCustomIntroText: string;
  // Intro screen must be shown when a time limit is set.
  hasTimeLimit: boolean;
  onChange: (fields: Partial<QuizConfigurationData>) => void;
}

// The intro screen's markdown content, edited in place at the top of the
// quiz outline and saved with Save quiz. Its title is the quiz display name,
// set in Configuration.
const IntroScreenCard: React.FunctionComponent<IntroScreenCardProps> = ({
  customIntroText,
  savedCustomIntroText,
  hasTimeLimit,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <BuilderCard
      iconName="hand-wave"
      name="Intro Screen"
      preview={customIntroText}
      itemLabel="intro screen"
      isExpanded={isExpanded}
      onExpandedChange={setIsExpanded}
      isDirty={customIntroText !== savedCustomIntroText}
      onDiscard={() => onChange({customIntroText: savedCustomIntroText})}
      onRemove={() => onChange({showIntroScreen: false})}
      cannotRemoveReason={
        hasTimeLimit
          ? 'Remove the time limit in Configuration before removing the intro screen.'
          : undefined
      }
    >
      <div className={builderCommonStyles.section}>
        <FormFieldWrapper
          label="Content"
          size="s"
          color="gray"
          helperMessage="Supports markdown."
          className={builderCommonStyles.fullWidthField}
        >
          <textarea
            className={builderCommonStyles.textarea}
            name="customIntroText"
            rows={6}
            value={customIntroText}
            onChange={e => onChange({customIntroText: e.target.value})}
          />
        </FormFieldWrapper>
      </div>
    </BuilderCard>
  );
};

export default IntroScreenCard;
