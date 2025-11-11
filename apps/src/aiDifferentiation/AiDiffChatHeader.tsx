import Button from '@code-dot-org/component-library/button';
import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import {ActionDropdownOption} from '@code-dot-org/component-library/dropdown/actionDropdown';
import {
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {PDFDownloadLink} from '@react-pdf/renderer';
import React, {useMemo} from 'react';

import {PersonalizationData} from '@cdo/apps/aiDifferentiation/hooks/useTeachingProfileData';
import {commonI18n} from '@cdo/apps/types/locale';

import AiDiffPdf from './AiDiffPdf';
import {ChatItem, SuggestPromptsType} from './types';

import style from './ai-differentiation.module.scss';

interface AiDiffChatHeaderProps {
  onSuggestPrompts: (promptType: SuggestPromptsType) => void;
  messages: ChatItem[];
  threadTitle?: string;
  personalizationData?: PersonalizationData;
}

const personaOptionsMap: Record<
  string,
  Omit<ActionDropdownOption, 'onClick'>
> = {
  'The Innovator': {
    value: 'innovator',
    label: 'Innovator',
    icon: {iconName: 'lightbulb-on'},
  },
  'The Code Whisperer': {
    value: 'codeWhisperer',
    label: 'Code Whisperer',
    icon: {iconName: 'code'},
  },
  'The Bridge Builder': {
    value: 'bridgeBuilder',
    label: 'Bridge Builder',
    icon: {iconName: 'bridge'},
  },
  'The Storyteller': {
    value: 'storyteller',
    label: 'Storyteller',
    icon: {iconName: 'book-open'},
  },
  'The Community Architect': {
    value: 'communityArchitect',
    label: 'Community Architect',
    icon: {iconName: 'users'},
  },
  'The Lead Learner': {
    value: 'leadLearner',
    label: 'Lead Learner',
    icon: {iconName: 'graduation-cap'},
  },
};

const AiDiffChatHeader: React.FC<AiDiffChatHeaderProps> = ({
  onSuggestPrompts,
  messages,
  threadTitle,
  personalizationData,
}) => {
  const suggestedPromptsDropdownOptions = useMemo(() => {
    const baseOptions: ActionDropdownOption[] = [
      {
        value: 'support',
        label: 'Get Started',
        icon: {iconName: 'rocket-launch'},
        onClick: () => onSuggestPrompts('support'),
      },
      {
        value: 'plan',
        label: 'Ideate',
        icon: {iconName: 'spinner-scale'},
        onClick: () => onSuggestPrompts('plan'),
      },
      {
        value: 'create',
        label: 'Create',
        icon: {iconName: 'file-pen'},
        onClick: () => onSuggestPrompts('create'),
      },
      {
        value: 'apcsp',
        label: 'AP Prep',
        icon: {iconName: 'laptop-code'},
        onClick: () => onSuggestPrompts('apcsp'),
      },
    ];

    const personaOption = personalizationData?.matchedPersona
      ? personaOptionsMap[personalizationData.matchedPersona]
      : undefined;

    if (personaOption) {
      baseOptions.push({
        ...personaOption,
        onClick: () =>
          onSuggestPrompts(personaOption.value as SuggestPromptsType),
      });
    }

    return baseOptions;
  }, [onSuggestPrompts, personalizationData?.matchedPersona]);

  return (
    <div className={style.chatHeader}>
      <div className={style.chatHeaderTitle}>
        <BodyThreeText noMargin>
          <StrongText>{threadTitle}</StrongText>
        </BodyThreeText>
      </div>
      <div className={style.chatHeaderButtons}>
        <ActionDropdown
          size="s"
          triggerButtonProps={{
            size: 's',
            color: 'gray',
            type: 'secondary',
            text: commonI18n.aiDifferentiation_suggest_prompt(),
            'aria-label': commonI18n.aiDifferentiation_suggest_prompt(),
            iconLeft: {iconName: 'solid-pen-sparkle', iconFamily: 'kit'},
          }}
          labelText={commonI18n.aiDifferentiation_suggest_prompt()}
          name="aiDiffChatHeaderDropdown"
          menuPlacement="right"
          options={suggestedPromptsDropdownOptions}
        />
        <PDFDownloadLink
          document={<AiDiffPdf messages={messages} />}
          fileName="ai_differentiation_chat.pdf"
        >
          <Button
            color="gray"
            size="s"
            type="secondary"
            isIconOnly
            icon={{iconName: 'download'}}
            onClick={() => {}}
            aria-label={commonI18n.aiDifferentiation_download_pdf()}
          />
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default AiDiffChatHeader;
