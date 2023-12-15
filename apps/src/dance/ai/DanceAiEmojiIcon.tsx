import React, {useCallback} from 'react';

import EmojiIcon from './EmojiIcon';
import {EmojiItem} from './types';

interface DanceAiEmojiIconProps {
  item: EmojiItem;
  handleItemClick: (itemId: string, isItemAvailable: boolean) => void;
  className?: string;
  isItemAvailable: boolean;
}

/**
 * This component renders an EmojiIcon with a dance ai modal specific click handler
 *
 * @param props
 * @param props.item the EmojiItem emoji
 * @param props.handleItemClick callback click handler to be called when the user clicks on an emoji
 * @param className class to attach to the emoji
 * @param isItemAvailable? boolean to determine if the emoji has been selected or not
 * @returns An EmojiIcon
 */

const DanceAiEmojiIcon: React.FunctionComponent<DanceAiEmojiIconProps> = ({
  item,
  handleItemClick = () => undefined,
  className,
  isItemAvailable = true,
}) => {
  const danceAiClickHandler = useCallback(
    () => handleItemClick(item.id, isItemAvailable),
    [handleItemClick, item.id, isItemAvailable]
  );

  return (
    <EmojiIcon
      item={item}
      onClick={danceAiClickHandler}
      className={className}
      isHighlighted={!isItemAvailable}
    />
  );
};

export default React.memo(DanceAiEmojiIcon);
