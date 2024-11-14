import {PDFDownloadLink} from '@react-pdf/renderer';
import React from 'react';

import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import Button from '@cdo/apps/componentLibrary/button';
import {commonI18n} from '@cdo/apps/types/locale';

import AiDiffPdf from './AiDiffPdf';
import {ChatItem} from './types';

import style from './ai-differentiation.module.scss';

interface AiDiffChatFooterProps {
  onSubmit: (msg: string) => void;
  messages: ChatItem[];
}

const AiDiffChatFooter: React.FC<AiDiffChatFooterProps> = ({
  onSubmit,
  messages,
}) => {
  return (
    <div className={style.chatFooter}>
      <UserMessageEditor
        onSubmit={onSubmit}
        disabled={false}
        customPlaceholder={commonI18n.aiDifferentiation_write_message()}
      />
      <div className={style.chatFooterButtons}>
        <Button
          color="black"
          size="s"
          type="secondary"
          iconLeft={{iconName: 'sparkles'}}
          onClick={() => null}
          text={commonI18n.aiDifferentiation_suggest_prompt()}
        />
        <PDFDownloadLink
          document={<AiDiffPdf messages={messages} />}
          fileName="ai_differentiation_chat.pdf"
        >
          <Button
            color="black"
            size="s"
            type="secondary"
            iconLeft={{iconName: 'download'}}
            onClick={() => null}
            text={commonI18n.aiDifferentiation_download_pdf()}
          />
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default AiDiffChatFooter;
