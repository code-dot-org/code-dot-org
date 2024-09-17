import React, {useMemo} from 'react';

import aiBotMini from '@cdo/static/dance/ai/bot/ai-bot-mini.svg';

import EmojiIcon from './EmojiIcon';
import {AiEmojiItem} from './types';

import moduleStyles from './dance-ai-modal.module.scss';

const i18n = require('../locale');

interface DanceAiModalHeaderProps {
  onClose: () => void;
  handleStartOverClick: () => void;
  selectedEmojis: AiEmojiItem[];
  slotCount: number;
}

/**
 * This component renders the header of Dance AI Modal.
 *
 * @param props
 * @param props.onClose callback to be called when the modal closes
 * @param props.handleStartOverClick callback for when the startover button is clicked
 * @param props.selectedEmojis array of AiEmojiItems the user has selected
 * @param props.slotCount number of slots to display

 * @returns A react element that renders the modal header
 */

const DanceAiModalHeader: React.FunctionComponent<DanceAiModalHeaderProps> = ({
  onClose,
  handleStartOverClick,
  selectedEmojis,
  slotCount,
}) => {
  const headerContent = useMemo(() => {
    const filledSelectedEmojis: (AiEmojiItem | undefined)[] = [
      ...selectedEmojis,
    ];
    filledSelectedEmojis.length = slotCount;
    filledSelectedEmojis.fill(undefined, selectedEmojis.length, slotCount);

    return (
      <div
        className={moduleStyles.inputsContainer}
        role="button"
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

  const headerTextSplit = useMemo(() => {
    // The header comes from a localized string like this: "generate {input} effect".
    // We split the localized string on the "{input}", and rebuild the HTML but with
    // the emoji box in place of that "{input}".
    const INPUT_KEY = '__CDO_INPUTS__';

    return i18n.danceAiModalHeading({input: INPUT_KEY}).split(INPUT_KEY);
  }, []);

  return (
    <div id="ai-modal-header-area" className={moduleStyles.headerArea}>
      <div className={moduleStyles.headerAreaLeft}>
        <img
          src={aiBotMini}
          className={moduleStyles.botImage}
          alt={i18n.danceAiModalBotAlt()}
        />
        {headerTextSplit[0]}
        {headerContent}
        {headerTextSplit[1]}
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
