import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {MuiCustomDialog as CustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';

import {getRunButtonSx} from '@cdo/apps/templates/runButtonSx';

import {CatalogEntry} from '../blockCatalog';
import {SceneType} from '../types';

import moduleStyles from './block-catalog.module.scss';

const TITLE = 'Discover blocks';

// Where a block can be used, by the scene type whose toolbox offers it.
const SCENE_TYPE_NOTES: Record<SceneType, string> = {
  platform: 'For platformer scenes',
  story: 'For story scenes',
};
const ANY_SCENE_NOTE = 'For any scene';

interface BlockCatalogDialogProps {
  entries: readonly CatalogEntry[];
  /** Block types already added to the toolbox. */
  chosen: ReadonlySet<string>;
  onAdd: (type: string) => void;
  onClose: () => void;
}

/**
 * The catalog of new blocks: a list on the left, the highlighted block's
 * help on the right, and an Add button that puts it in the toolbox.
 */
const BlockCatalogDialog: React.FunctionComponent<BlockCatalogDialogProps> = ({
  entries,
  chosen,
  onAdd,
  onClose,
}) => {
  const {theme} = useTheme();
  const mode = theme === 'Dark' ? 'dark' : 'light';
  // Opens on the first block not yet added, so the next choice is in view.
  const [selectedType, setSelectedType] = useState(
    () => (entries.find(entry => !chosen.has(entry.type)) ?? entries[0])?.type
  );
  const selected = entries.find(entry => entry.type === selectedType);
  const added = !!selected && chosen.has(selected.type);

  return (
    <div className={moduleStyles.dialogHost} data-theme={mode}>
      <CustomDialog
        aria-label={TITLE}
        onClose={onClose}
        mode={mode}
        className={moduleStyles.dialog}
      >
        <div className={moduleStyles.header}>
          {/* Not a plus: the tile is a sign, not a button. */}
          <div className={moduleStyles.headerIcon} aria-hidden="true">
            <FontAwesomeV6Icon iconName="compass" />
          </div>
          <div>
            <h2>{TITLE}</h2>
            <p>Pick a block to read about it, then add it to your toolbox.</p>
          </div>
        </div>
        <div className={moduleStyles.columns}>
          <ul className={moduleStyles.list} aria-label="New blocks">
            {entries.map(entry => (
              <li key={entry.type}>
                <button
                  type="button"
                  className={moduleStyles.listItem}
                  aria-current={
                    entry.type === selectedType ? 'true' : undefined
                  }
                  onClick={() => setSelectedType(entry.type)}
                >
                  <span className={moduleStyles.listTitle}>
                    {entry.help.title}
                  </span>
                  {chosen.has(entry.type) && (
                    <span
                      className={moduleStyles.added}
                      role="img"
                      aria-label="Added"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
          <div className={moduleStyles.info}>
            {selected && (
              <>
                <div className={moduleStyles.infoHeader}>
                  <h3>{selected.help.title}</h3>
                  <span className={moduleStyles.scenePill}>
                    {selected.sceneType
                      ? SCENE_TYPE_NOTES[selected.sceneType]
                      : ANY_SCENE_NOTE}
                  </span>
                </div>
                <div className={moduleStyles.infoRow}>
                  {selected.help.animation && (
                    <img
                      className={moduleStyles.animation}
                      src={selected.help.animation.src}
                      alt={selected.help.animation.alt}
                    />
                  )}
                  <div className={moduleStyles.infoText}>
                    <p className={moduleStyles.summary}>
                      {selected.help.summary}
                    </p>
                    {selected.help.body}
                  </div>
                </div>
                <div className={moduleStyles.addRow}>
                  {added ? (
                    <p className={moduleStyles.addedNote}>
                      <span className={moduleStyles.added} aria-hidden="true" />
                      Added to your toolbox
                    </p>
                  ) : (
                    <MuiButton
                      variant="contained"
                      color="primary"
                      sx={getRunButtonSx(null)}
                      startIcon={<FontAwesomeV6Icon iconName="plus" />}
                      onClick={() => onAdd(selected.type)}
                    >
                      Add block
                    </MuiButton>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className={moduleStyles.footer}>
          <MuiButton variant="outlined" color="secondary" onClick={onClose}>
            Done
          </MuiButton>
        </div>
      </CustomDialog>
    </div>
  );
};

export default BlockCatalogDialog;
