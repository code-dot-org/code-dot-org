import React, {useCallback} from 'react';

import EmojiIcon from './EmojiIcon';

type AiModalItem = {
  id: string;
  emoji: string;
};

interface DanceAiEmojiIconProps {
  item: AiModalItem;
  handleItemClick: (itemId: string, isItemAvailable: boolean) => void;
  className?: string;
  isItemAvailable: boolean;
}

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
