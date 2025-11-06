import Button from '@code-dot-org/component-library/button';
import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import {
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {PDFDownloadLink} from '@react-pdf/renderer';
import React from 'react';

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

const AiDiffChatHeader: React.FC<AiDiffChatHeaderProps> = ({
  onSuggestPrompts,
  messages,
  threadTitle,
  // personalizationData,
}) => {
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
          options={[
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
          ]}
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
