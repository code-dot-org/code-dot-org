import React from 'react';
import classNames from 'classnames';

import {getEmojiImageUrl} from './utils';
import {DanceAiModelItem} from './types';

import moduleStyles from './dance-ai-modal.module.scss';

interface EmojiIconProps {
  item: DanceAiModelItem;
  onClick?: () => void;
  className?: string;
  isHighlighted?: boolean;
}

const EmojiIcon: React.FunctionComponent<EmojiIconProps> = ({
  item,
  onClick,
  className,
  isHighlighted,
}) => {
  const isButton = onClick !== undefined;
  const Tag = isButton ? 'button' : 'div';

  return (
    <Tag
      type={isButton ? 'button' : undefined}
      onClick={onClick}
      style={{
        backgroundImage: `url(${getEmojiImageUrl(item.id)})`,
      }}
      className={classNames(
        moduleStyles.emojiIcon,
        isButton && moduleStyles.emojiIconButton,
        isHighlighted && moduleStyles.emojiIconButtonHighlighted,
        className
      )}
      aria-label={item.emoji}
    />
  );
};

export default React.memo(EmojiIcon);
