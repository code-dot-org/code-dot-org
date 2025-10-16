import Button from '@code-dot-org/component-library/button';
import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import {
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {PDFDownloadLink} from '@react-pdf/renderer';
import React from 'react';

import {commonI18n} from '@cdo/apps/types/locale';

import AiDiffPdf from './AiDiffPdf';
import {ChatItem} from './types';

import style from './ai-differentiation.module.scss';

interface AiDiffChatHeaderProps {
  onSuggestPrompts: () => void;
  messages: ChatItem[];
  threadTitle?: string;
  disableEndButtons: boolean;
}

const AiDiffChatHeader: React.FC<AiDiffChatHeaderProps> = ({
  onSuggestPrompts,
  messages,
  threadTitle,
  disableEndButtons,
}) => {
  return (
    <div className={style.chatHeader}>
      <div className={style.chatHeaderTitle}>
        <BodyThreeText noMargin>
          <StrongText>{threadTitle}</StrongText>
        </BodyThreeText>
      </div>
      {!disableEndButtons && (
        <div className={style.chatHeaderButtons}>
          <ActionDropdown
            size="s"
            triggerButtonProps={{
              size: 's',
              color: 'gray',
              type: 'secondary',
              text: commonI18n.aiDifferentiation_suggest_prompt(),
              iconLeft: {iconName: 'sparkles'},
            }}
            labelText={commonI18n.aiDifferentiation_suggest_prompt()}
            name="aiDiffChatHeaderDropdown"
            options={[
              {
                value: 'getStarted',
                label: 'Get Started',
                icon: {iconName: 'rocket-launch'},
                onClick: onSuggestPrompts,
              },
              {
                value: 'ideate',
                label: 'Ideate',
                icon: {iconName: 'spinner-scale'},
                onClick: onSuggestPrompts,
              },
              {
                value: 'create',
                label: 'Create',
                icon: {iconName: 'file-pen'},
                onClick: onSuggestPrompts,
              },
              {
                value: 'apPrep',
                label: 'Ap Prep',
                icon: {iconName: 'laptop-code'},
                onClick: onSuggestPrompts,
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
      )}
    </div>
  );
};

export default AiDiffChatHeader;
