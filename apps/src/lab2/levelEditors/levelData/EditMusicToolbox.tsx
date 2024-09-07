import classNames from 'classnames';
import React, {useCallback} from 'react';

import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import Link from '@cdo/apps/componentLibrary/link/Link';
import SegmentedButtons from '@cdo/apps/componentLibrary/segmentedButtons/SegmentedButtons';
import {
  BodyThreeText,
  BodyTwoText,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import {BlockTypes} from '@cdo/apps/music/blockly/blockTypes';
import {MUSIC_BLOCKS} from '@cdo/apps/music/blockly/musicBlocks';
import {categoryTypeToLocalizedName} from '@cdo/apps/music/blockly/toolbox';
import {defaultMaps} from '@cdo/apps/music/blockly/toolbox/definitions';
import toolboxBlocks from '@cdo/apps/music/blockly/toolbox/toolboxBlocks';
import {
  Category,
  ToolboxData,
  ToolboxType,
} from '@cdo/apps/music/blockly/toolbox/types';
import {BlockConfig} from '@cdo/apps/music/blockly/types';
import {BlockMode} from '@cdo/apps/music/constants';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';
import {getTypedKeys, ValueOf} from '@cdo/apps/types/utils';

import styles from './edit-music-level-data.module.scss';

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

const typedMusicBlocks = MUSIC_BLOCKS as {[key: string]: BlockConfig};

interface EditMusicToolboxProps {
  toolbox: ToolboxData;
  blockMode: ValueOf<typeof BlockMode>;
  onChange: (toolbox: ToolboxData) => void;
  onBlockModeChange: (blockMode: ValueOf<typeof BlockMode>) => void;
}

const EditMusicToolbox: React.FunctionComponent<EditMusicToolboxProps> = ({
  toolbox,
  blockMode,
  onChange,
  onBlockModeChange,
}) => {
  const defaultBlocks = defaultMaps[blockMode];

  const toggleBlock = useCallback(
    (category: Category, block: BlockTypes | string, checked: boolean) => {
      const newToolbox = {...toolbox};
      if (!newToolbox.blocks[category]) {
        newToolbox.blocks[category] = [];
      }
      if (checked) {
        newToolbox.blocks[category].push(block);
      } else {
        newToolbox.blocks[category] = newToolbox.blocks[category].filter(
          b => b !== block
        );
      }

      if (newToolbox.blocks[category].length === 0) {
        delete newToolbox.blocks[category];
      }
      onChange(newToolbox);
    },
    [toolbox, onChange]
  );

  return (
    <div className={classNames(styles.section, styles.topSpacing)}>
      <div className={styles.row}>
        <BodyThreeText className={styles.noMargin}>
          Sequencing Model:
        </BodyThreeText>
        <SegmentedButtons
          size="xs"
          selectedButtonValue={blockMode}
          buttons={Object.values(BlockMode).map(value => ({
            value,
            label: value,
          }))}
          onChange={value => {
            onBlockModeChange(value as ValueOf<typeof BlockMode>);
          }}
        />
      </div>
      <i>
        Note that currently, all levels will use the Simple2 sequencing model by
        default. The advanced model is only usable by adding '?blocks=advanced'
        to the URL.
      </i>
      <div className={styles.row}>
        <BodyThreeText className={styles.noMargin}>Toolbox Type:</BodyThreeText>
        <SegmentedButtons
          size="xs"
          selectedButtonValue={toolbox.type || 'category'}
          buttons={[
            {
              label: 'Category',
              value: 'category',
            },
            {
              label: 'Flyout',
              value: 'flyout',
            },
          ]}
          onChange={value => {
            onChange({...toolbox, type: value as ToolboxType});
          }}
        />
      </div>
      <BodyTwoText className={classNames(styles.topSpacing, styles.noMargin)}>
        Choose Toolbox Blocks:
      </BodyTwoText>
      {getTypedKeys(defaultBlocks).map(category => {
        const categoryIncluded = toolbox.blocks[category] !== undefined;
        const name = categoryTypeToLocalizedName[category];
        return (
          <div key={category}>
            <CollapsibleSection
              headerContent={
                categoryIncluded ? <StrongText>{name}</StrongText> : name
              }
            >
              <div
                className={classNames(
                  styles.indentedContainer,
                  styles.checkboxColumn
                )}
              >
                {(defaultBlocks[category] || []).map(block => {
                  const blockType = toolboxBlocks[block].type;
                  const helpUrl = blockType
                    ? typedMusicBlocks[blockType]?.definition?.helpUrl
                    : null;
                  return (
                    <div className={styles.checkboxRow} key={block}>
                      <Checkbox
                        checked={
                          toolbox.blocks[category]?.includes(block) || false
                        }
                        name={block}
                        label={blockDescriptions[block] || block}
                        onChange={event =>
                          toggleBlock(category, block, event.target.checked)
                        }
                        size="xs"
                      />
                      {helpUrl && (
                        <Link href={helpUrl} size="s" openInNewTab={true}>
                          <FontAwesomeV6Icon iconName="arrow-up-right-from-square" />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          </div>
        );
      })}
    </div>
  );
};

export default EditMusicToolbox;
