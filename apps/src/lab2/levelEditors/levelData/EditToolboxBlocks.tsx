import classNames from 'classnames';
import {isEqual} from 'lodash';
import React, {useCallback} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import {BlockTypes} from '@cdo/apps/music/blockly/blockTypes';
import {
  categoryTypeToLocalizedName,
  dynamicCategories,
} from '@cdo/apps/music/blockly/toolbox';
import {defaultMaps} from '@cdo/apps/music/blockly/toolbox/definitions';
import {
  Category,
  CategoryBlocksMap,
  ToolboxType,
} from '@cdo/apps/music/blockly/toolbox/types';
import {BlockMode} from '@cdo/apps/music/constants';
import {getTypedKeys, ValueOf} from '@cdo/apps/types/utils';

import MultiCategorySelect from './MultiCategorySelect';

import styles from './edit-music-level-data.module.scss';

// Levelbuilder-facing English block names.
const blockDescriptions: {[blockType in BlockTypes | string]?: string} = {
  [BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2]: 'Play Sound',
  [BlockTypes.PLAY_PATTERN_AT_CURRENT_LOCATION_SIMPLE2]: 'Play Pattern',
  [BlockTypes.PLAY_CHORD_AT_CURRENT_LOCATION_SIMPLE2]: 'Play Chord',
  [BlockTypes.PLAY_REST_AT_CURRENT_LOCATION_SIMPLE2]: 'Rest',
  [BlockTypes.TRIGGERED_AT_SIMPLE2]: 'Trigger',
  [BlockTypes.PLAY_SOUNDS_TOGETHER]: 'Play Together',
  [BlockTypes.PLAY_SOUNDS_SEQUENTIAL]: 'Play Sequential',
  [BlockTypes.PLAY_SOUNDS_RANDOM]: 'Play Random',
  [BlockTypes.REPEAT_SIMPLE2]: 'Repeat',
  [BlockTypes.SET_VOLUME_EFFECT_AT_CURRENT_LOCATION_SIMPLE2]: 'Set Volume',
  [BlockTypes.SET_FILTER_EFFECT_AT_CURRENT_LOCATION_SIMPLE2]: 'Set Filter',
  [BlockTypes.SET_DELAY_EFFECT_AT_CURRENT_LOCATION_SIMPLE2]: 'Set Delay',
};

interface EditToolboxBlocksProps {
  blocksMap: CategoryBlocksMap;
  onChange: (blocksMap: CategoryBlocksMap) => void;
  blockMode: ValueOf<typeof BlockMode>;
  toolboxType?: ToolboxType;
}

const EditToolboxBlocks: React.FC<EditToolboxBlocksProps> = ({
  blocksMap,
  onChange,
  blockMode,
  toolboxType,
}) => {
  const defaultBlocks = defaultMaps[blockMode];
  const includedDynamicCategories =
    toolboxType === 'flyout'
      ? []
      : dynamicCategories.filter(category => defaultBlocks[category]);

  const toggleBlock = useCallback(
    (category: Category, block: BlockTypes | string, checked: boolean) => {
      const newBlocksMap = {...blocksMap};
      if (!newBlocksMap[category]) {
        newBlocksMap[category] = [];
      }
      if (checked) {
        newBlocksMap[category].push(block);
      } else {
        newBlocksMap[category] = newBlocksMap[category].filter(
          b => b !== block
        );
      }

      if (newBlocksMap[category].length === 0) {
        delete newBlocksMap[category];
      }
      onChange(newBlocksMap);
    },
    [blocksMap, onChange]
  );

  const toggleCategory = useCallback(
    (category: Category, checked: boolean) => {
      const newBlocksMap = {...blocksMap};
      if (checked) {
        newBlocksMap[category] = defaultBlocks[category] || [];
      } else {
        delete newBlocksMap[category];
      }
      onChange(newBlocksMap);
    },
    [blocksMap, onChange, defaultBlocks]
  );

  const multiSelectItems = getTypedKeys(defaultBlocks)
    .filter(category => !dynamicCategories.includes(category))
    .map(category => {
      const categoryItems = (defaultBlocks[category] || []).map(block => {
        return {
          id: block,
          label: blockDescriptions[block] || block,
          selected: blocksMap[category]?.includes(block) || false,
        };
      });
      return {
        categoryId: category,
        categoryLabel: categoryTypeToLocalizedName[category],
        categoryItems,
      };
    });

  return (
    <div className={styles.section}>
      <BodyTwoText className={classNames(styles.noMargin)}>
        Allowed Blocks:
      </BodyTwoText>
      <div className={classNames(styles.verticalFlex, styles.gapMedium)}>
        <Button
          text="Select All"
          onClick={() => onChange(defaultBlocks)}
          size="xs"
          iconLeft={{iconName: 'circle-check'}}
          disabled={isEqual(blocksMap, defaultBlocks)}
        />
        <Button
          text="Clear All"
          onClick={() => onChange({})}
          size="xs"
          iconLeft={{iconName: 'ban'}}
          color="destructive"
          type="secondary"
          disabled={Object.keys(blocksMap).length === 0}
        />
      </div>
      <MultiCategorySelect
        items={multiSelectItems}
        onToggle={(categoryId, itemId, selected) =>
          toggleBlock(categoryId as Category, itemId, selected)
        }
        onToggleCategory={(categoryId, selected) =>
          toggleCategory(categoryId as Category, selected)
        }
      />
      {includedDynamicCategories.map(category => (
        <Checkbox
          key={category}
          name={`include-${category}`}
          label={`${categoryTypeToLocalizedName[category]}`}
          checked={!!blocksMap[category]}
          onChange={event => {
            const newBlocks = {...blocksMap};
            if (event.target.checked) {
              newBlocks[category] = [];
            } else {
              delete newBlocks[category];
            }
            onChange(newBlocks);
          }}
          size="m"
        />
      ))}
    </div>
  );
};

export default EditToolboxBlocks;
