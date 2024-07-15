import classNames from 'classnames';
import React, {useMemo} from 'react';

import {EmojiItem} from './types';
import {getEmojiImageUrl} from './utils';

import moduleStyles from './dance-ai-modal.module.scss';

export interface EmojiIconProps {
  item: EmojiItem;
  onClick?: (itemId: string) => void;
  className?: string;
  isHighlighted?: boolean;
}

/**
 * This component renders an EmojiIcon
 *
 * @param props
 * @param props.item the EmojiItem emoji
 * @param props.onClick callback click handler to be called when the user clicks on an emoji
 * @param className class to attach to the emoji
 * @param isHighlighted boolean to determine if the emoji should be drawn highlighted
 * @returns An EmojiIcon
 */

const EmojiIcon: React.FunctionComponent<EmojiIconProps> = ({
  item,
  onClick,
  className,
  isHighlighted,
}) => {
  const isButton = onClick !== undefined;
  const Tag = isButton ? 'button' : 'div';

  const clickHandler = useMemo(() => {
    return onClick ? () => onClick(item.id) : undefined;
  }, [onClick, item]);

  return (
    <Tag
      type={isButton ? 'button' : undefined}
      onClick={clickHandler}
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
