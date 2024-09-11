import classNames from 'classnames';
import {isEqual} from 'lodash';
import React, {useCallback} from 'react';

import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import SegmentedButtons from '@cdo/apps/componentLibrary/segmentedButtons/SegmentedButtons';
import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import {defaultMaps} from '@cdo/apps/music/blockly/toolbox/definitions';
import {
  CategoryBlocksMap,
  ToolboxData,
  ToolboxType,
} from '@cdo/apps/music/blockly/toolbox/types';
import {BlockMode} from '@cdo/apps/music/constants';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';
import {ValueOf} from '@cdo/apps/types/utils';

import EditToolboxBlocks from './EditToolboxBlocks';
import PreviewMusicWorkspace from './PreviewMusicWorkspace';

import styles from './edit-music-level-data.module.scss';

interface EditMusicToolboxProps {
  toolbox: ToolboxData;
  blockMode: ValueOf<typeof BlockMode>;
  onChange: (toolbox: ToolboxData) => void;
  onBlockModeChange: (blockMode: ValueOf<typeof BlockMode>) => void;
  startSources?: object;
}

const ChangeWarning: React.FC = () => (
  <Alert
    type="warning"
    size="xs"
    text="Changing these settings will reset toolbox blocks."
  />
);

const EditMusicToolbox: React.FunctionComponent<EditMusicToolboxProps> = ({
  toolbox,
  blockMode,
  onChange,
  onBlockModeChange,
  startSources,
}) => {
  const defaultBlocks = defaultMaps[blockMode];
  const onBlocksChange = useCallback(
    (blocksMap: CategoryBlocksMap) => {
      // If the updated allowlist of blocks is the same as the default set,
      // set blocks to undefined to automatically use the default set.
      const newBlocks = isEqual(blocksMap, defaultBlocks)
        ? undefined
        : blocksMap;
      onChange({...toolbox, blocks: newBlocks});
    },
    [onChange, toolbox, defaultBlocks]
  );

  return (
    <div
      className={classNames(
        styles.verticalFlex,
        styles.gapMedium,
        styles.topSpacing
      )}
    >
      <CollapsibleSection headerContent={'Setup'}>
        <div
          className={classNames(
            styles.verticalFlex,
            styles.gapMedium,
            styles.infoPanel
          )}
        >
          <ChangeWarning />
          <div className={classNames(styles.horizontalFlex, styles.gapMedium)}>
            <div
              className={classNames(
                styles.verticalFlex,
                styles.gapMedium,
                styles.flexAll
              )}
            >
              <div className={styles.row}>
                <BodyTwoText className={styles.noMargin}>
                  Sequencing Model:
                </BodyTwoText>
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
                Note that currently, all levels will use the Simple2 sequencing
                model by default. The advanced model is only usable by adding
                '?blocks=advanced' to the URL.
              </i>
            </div>
            <div
              className={classNames(
                styles.verticalFlex,
                styles.gapMedium,
                styles.flexAll
              )}
            >
              {/* <div className={styles.row}>
                <BodyTwoText className={styles.noMargin}>
                  Toolbox Mode:
                </BodyTwoText>
                <SegmentedButtons
                  size="xs"
                  selectedButtonValue={toolbox.blocks ? 'restricted' : 'full'}
                  buttons={[
                    {
                      label: 'Restricted',
                      value: 'restricted',
                    },
                    {
                      label: 'Full',
                      value: 'full',
                    },
                  ]}
                  onChange={value => {
                    const newToolbox = {...toolbox};
                    if (value === 'restricted') {
                      newToolbox.blocks = {};
                    } else {
                      delete newToolbox.blocks;
                    }
                    onChange(newToolbox);
                  }}
                />
              </div> */}
              <i>
                Choose 'Restricted' to limit the allowed blocks available in the
                toolbox.
                <br />
                Choose 'Full' to enable ALL blocks for the selected sequencing
                model (including blocks added in the future).
              </i>
            </div>
          </div>
        </div>
      </CollapsibleSection>
      <div className={classNames(styles.horizontalFlex, styles.gapMedium)}>
        <div className={classNames(styles.verticalFlex, styles.gapMedium)}>
          <BodyTwoText className={styles.noMargin}>Toolbox Type:</BodyTwoText>
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

          <EditToolboxBlocks
            blocksMap={toolbox.blocks || defaultBlocks}
            onChange={onBlocksChange}
            blockMode={blockMode}
          />
        </div>
        <PreviewMusicWorkspace
          toolboxData={toolbox}
          blockMode={blockMode}
          startSources={startSources}
        />
      </div>
    </div>
  );
};

export default EditMusicToolbox;
