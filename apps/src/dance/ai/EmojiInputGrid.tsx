import React from 'react';

import EmojiIcon, {EmojiIconProps} from './EmojiIcon';
import {EmojiItem} from './types';

import moduleStyles from './dance-ai-modal.module.scss';

type EmojiInputGrid = {
  inputLibrary: {items: EmojiItem[]};
  onClick: EmojiIconProps['onClick'];
  isHighlighted: (item: EmojiItem) => boolean;
  IconComponent?: React.FunctionComponent<EmojiIconProps>;
};

const defaultIsHighlighted = (item: EmojiItem) => false;

/**
 * This component renders the input grid of emojis for the user to select from
 *
 * @param props
 * @param props.selectedEmojis An array of emojis the user has currently selected.
 * @param props.onClick callback click handler to be called when the user clicks on an emoji
 * @returns A react element that renders the emoji input grid.
 */

const EmojiInputGrid: React.FunctionComponent<EmojiInputGrid> = ({
  onClick,
  inputLibrary,
  isHighlighted = defaultIsHighlighted,
  IconComponent = EmojiIcon,
}) => {
  return (
    <div id="inputs-area" className={moduleStyles.inputsArea}>
      <div id="inputs-container" className={moduleStyles.inputsContainer}>
        {inputLibrary.items.map(item => {
          const itemHighlighted = isHighlighted(item);
          return (
            <IconComponent
              key={item.id}
              item={item}
              onClick={onClick}
              isHighlighted={itemHighlighted}
            />
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(EmojiInputGrid);
