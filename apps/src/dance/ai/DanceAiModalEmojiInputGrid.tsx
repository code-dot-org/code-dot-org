import React from 'react';
import moduleStyles from './dance-ai-modal.module.scss';

import {DanceAiModelItem} from './types';

import DanceAiEmojiIcon from './DanceAiEmojiIcon';
import inputLibraryJson from '@cdo/static/dance/ai/ai-inputs.json';

type DanceAiModalEmojiInputGrid = {
  selectedEmojis: DanceAiModelItem[];
  handleItemClick: (id: string, available: boolean) => void;
};

/**
 * This component renders the input grid of emojis for the user to select from
 *
 * @param props
 * @param props.selectedEmojis An array of emojis the user has currently selected.
 * @param props.handleItemClick callback click handler to be called when the user clicks on an emoji
 * @returns A react element that renders the emoji input grid.
 */

const DanceAiModalEmojiInputGrid: React.FunctionComponent<
  DanceAiModalEmojiInputGrid
> = ({selectedEmojis, handleItemClick}) => {
  return (
    <div id="inputs-area" className={moduleStyles.inputsArea}>
      <div id="inputs-container" className={moduleStyles.inputsContainer}>
        {inputLibraryJson.items.map(item => {
          const isItemAvailable = !selectedEmojis.some(
            selectedItem => selectedItem.id === item.id
          );
          return (
            <DanceAiEmojiIcon
              key={item.id}
              item={item}
              handleItemClick={handleItemClick}
              isItemAvailable={isItemAvailable}
            />
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(DanceAiModalEmojiInputGrid);
