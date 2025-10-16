import Button from '@code-dot-org/component-library/button';
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
          <Button
            color="gray"
            size="s"
            type="secondary"
            iconLeft={{iconName: 'sparkles'}}
            onClick={onSuggestPrompts}
            text={commonI18n.aiDifferentiation_suggest_prompt()}
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
      <div className={style.chatHeaderButtons}>
        <Button
          color="gray"
          size="s"
          type="secondary"
          iconLeft={{iconName: 'sparkles'}}
          onClick={onSuggestPrompts}
          text={commonI18n.aiDifferentiation_suggest_prompt()}
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
