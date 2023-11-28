import React, {useMemo} from 'react';
import moduleStyles from './dance-ai-modal.module.scss';
import aiBotMini from '@cdo/static/dance/ai/bot/ai-bot-mini.svg';
const i18n = require('../locale');

import {DanceAiModelItem} from './types';

import EmojiIcon from './EmojiIcon';

interface DanceAiModalHeaderProps {
  onClose: () => void;
  handleStartOverClick: () => void;
  selectedEmojis: DanceAiModelItem[];
  slotCount: number;
}

const DanceAiModalHeader: React.FunctionComponent<DanceAiModalHeaderProps> = ({
  onClose,
  handleStartOverClick,
  selectedEmojis,
  slotCount,
}) => {
  const headerValue = useMemo(() => {
    const filledSelectedEmojis: (DanceAiModelItem | undefined)[] = [
      ...selectedEmojis,
    ];
    filledSelectedEmojis.length = slotCount;
    filledSelectedEmojis.fill(undefined, selectedEmojis.length, slotCount);

    return (
      <div
        className={moduleStyles.inputsContainer}
        tabIndex={0}
        onClick={handleStartOverClick}
      >
        {filledSelectedEmojis.map((item, index) => (
          <div key={item?.id || index} className={moduleStyles.emojiSlot}>
            {item && (
              <EmojiIcon item={item} className={moduleStyles.emojiSlotIcon} />
            )}
          </div>
        ))}
      </div>
    );
  }, [handleStartOverClick, selectedEmojis, slotCount]);

  // The header comes from a localized string like this: "generate {input} effect".
  // We split the localized string on the "{input}", and rebuild the HTML but with
  // the emoji box in place of that "{input}".
  const INPUT_KEY = '__CDO_INPUTS__';
  const headerTextSplit = i18n
    .danceAiModalHeading({input: INPUT_KEY})
    .split(INPUT_KEY);

  const headerContent = useMemo(
    () => [headerTextSplit[0], headerValue, headerTextSplit[1]],
    [headerTextSplit, headerValue]
  );

  return (
    <div id="ai-modal-header-area" className={moduleStyles.headerArea}>
      <div className={moduleStyles.headerAreaLeft}>
        <img
          src={aiBotMini}
          className={moduleStyles.botImage}
          alt={i18n.danceAiModalBotAlt()}
        />
        {headerContent}
      </div>
      <div
        id="ai-modal-header-area-right"
        className={moduleStyles.headerAreaRight}
      >
        <button
          className={moduleStyles.closeButton}
          data-dismiss="modal"
          type="button"
          onClick={onClose}
        >
          <i className="fa fa-close" aria-hidden={true} />
          <span className="sr-only">{i18n.danceAiModalClose()}</span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(DanceAiModalHeader);
