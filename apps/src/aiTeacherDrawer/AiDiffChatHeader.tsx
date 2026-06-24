import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import {ActionDropdownOption} from '@code-dot-org/component-library/dropdown/actionDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Divider,
  Tooltip,
  Typography,
  IconButton as MuiIconButton,
} from '@mui/material';
import {PDFDownloadLink} from '@react-pdf/renderer';
import React, {useCallback, useMemo, useState} from 'react';

import {PersonalizationData} from '@cdo/apps/aiDifferentiation/hooks/useTeachingProfileData';
import {commonI18n} from '@cdo/apps/types/locale';

import AiDiffPdf from './AiDiffPdf';
import {ChatItem, SuggestPromptsType} from './types';

import style from './ai-differentiation.module.scss';

interface AiDiffChatHeaderProps {
  onSuggestPrompts: (promptType: SuggestPromptsType) => void;
  onNewChat?: () => void;
  onViewThreads?: () => void;
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
  onNewChat,
  onViewThreads,
  messages,
  threadTitle,
  personalizationData,
}) => {
  const [suggestPromptsHovered, setSuggestPromptsHovered] = useState(false);
  const [suggestPromptsMenuOpen, setSuggestPromptsMenuOpen] = useState(false);

  // ActionDropdown calls setActiveDropdownName('') on the outer DropdownContext,
  // but CustomDropdown reads its own inner DropdownProviderWrapper — they don't
  // share state. Trigger CustomDropdown's existing mousedown-outside handler by
  // dispatching on document.body, which is always outside the dropdown ref.
  const closeDropdown = useCallback(() => {
    document.body.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
  }, []);

  const suggestedPromptsDropdownOptions = useMemo(() => {
    const baseOptions: ActionDropdownOption[] = [
      {
        value: 'support',
        label: 'Get Started',
        icon: {iconName: 'rocket-launch'},
        onClick: () => { onSuggestPrompts('support'); closeDropdown(); },
      },
      {
        value: 'plan',
        label: 'Ideate',
        icon: {iconName: 'spinner-scale'},
        onClick: () => { onSuggestPrompts('plan'); closeDropdown(); },
      },
      {
        value: 'create',
        label: 'Create',
        icon: {iconName: 'file-pen'},
        onClick: () => { onSuggestPrompts('create'); closeDropdown(); },
      },
      {
        value: 'apcsp',
        label: 'AP Prep',
        icon: {iconName: 'laptop-code'},
        onClick: () => { onSuggestPrompts('apcsp'); closeDropdown(); },
      },
    ];

    const personaOption = personalizationData?.matchedPersona
      ? personaOptionsMap[personalizationData.matchedPersona]
      : undefined;

    if (personaOption) {
      baseOptions.push({
        ...personaOption,
        onClick: () => {
          onSuggestPrompts(personaOption.value as SuggestPromptsType);
          closeDropdown();
        },
      });
    }

    return baseOptions;
  }, [onSuggestPrompts, personalizationData?.matchedPersona, closeDropdown]);

  return (
    <div className={style.chatHeader}>
      <div className={style.chatHeaderTitle}>
        <Typography variant="body3">
          <Typography variant="strong">{threadTitle}</Typography>
        </Typography>
      </div>
      <div className={style.chatHeaderButtons}>
        <PDFDownloadLink
          document={<AiDiffPdf messages={messages} />}
          fileName="ai_differentiation_chat.pdf"
          tabIndex={-1}
          style={{outline: 'none'}}
        >
          <Tooltip title={commonI18n.aiDifferentiation_download_pdf()}>
            <MuiIconButton
              variant="text"
              color="tertiary"
              size="small"
              onClick={() => {}}
              aria-label={commonI18n.aiDifferentiation_download_pdf()}
              type="button"
            >
              <FontAwesomeV6Icon iconName="download" />
            </MuiIconButton>
          </Tooltip>
        </PDFDownloadLink>
        <span
          onMouseEnter={() => setSuggestPromptsHovered(true)}
          onMouseLeave={() => {
            setSuggestPromptsHovered(false);
            setSuggestPromptsMenuOpen(false);
          }}
          onClick={() => setSuggestPromptsMenuOpen(true)}
        >
          <Tooltip
            title={commonI18n.aiDifferentiation_suggest_prompt()}
            open={suggestPromptsHovered && !suggestPromptsMenuOpen}
            disableHoverListener
            disableFocusListener
            disableTouchListener
          >
            <span>
              <ActionDropdown
                size="s"
                useIconButton={true}
                triggerButtonProps={{
                  size: 'small',
                  color: 'tertiary',
                  variant: 'text',
                  'aria-label': commonI18n.aiDifferentiation_suggest_prompt(),
                  children: (
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
            </span>
          </Tooltip>
        </span>
        <Divider orientation="vertical" flexItem />
        <Tooltip title="New Chat">
          <MuiIconButton
            variant="text"
            color="tertiary"
            size="small"
            onClick={onNewChat}
            aria-label="New Chat"
            type="button"
          >
            <FontAwesomeV6Icon iconName="plus" />
          </MuiIconButton>
        </Tooltip>
        <Tooltip title="View Threads">
          <MuiIconButton
            variant="text"
            color="tertiary"
            size="small"
            onClick={onViewThreads}
            aria-label="View Threads"
            type="button"
          >
            <FontAwesomeV6Icon iconName="comment" />
          </MuiIconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default AiDiffChatHeader;
