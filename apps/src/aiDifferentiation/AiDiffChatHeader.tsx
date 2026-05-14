import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import {ActionDropdownOption} from '@code-dot-org/component-library/dropdown/actionDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, IconButton as MuiIconButton} from '@mui/material';
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
        <Typography variant="body3">
          <Typography variant="strong">{threadTitle}</Typography>
        </Typography>
      </div>
      <div className={style.chatHeaderButtons}>
        <ActionDropdown
          size="s"
          useIconButton={false}
          triggerButtonProps={{
            size: 'small',
            color: 'tertiary',
            variant: 'outlined',
            children: commonI18n.aiDifferentiation_suggest_prompt(),
            'aria-label': commonI18n.aiDifferentiation_suggest_prompt(),
            startIcon: (
              <FontAwesomeV6Icon
                iconName="solid-pen-sparkle"
                iconFamily="kit"
              />
            ),
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
          <MuiIconButton
            variant="outlined"
            color="tertiary"
            size="small"
            onClick={() => {}}
            aria-label={commonI18n.aiDifferentiation_download_pdf()}
            type="button"
          >
            <FontAwesomeV6Icon iconName="download" />
          </MuiIconButton>
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default AiDiffChatHeader;
