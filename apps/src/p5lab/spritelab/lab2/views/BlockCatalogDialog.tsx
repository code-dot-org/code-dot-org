import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Modal from '@code-dot-org/component-library/modal';
import {Markdown} from '@code-dot-org/markdown';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

import {getRunButtonSx} from '@cdo/apps/templates/runButtonSx';

import {CatalogEntry} from '../blockCatalog';

import moduleStyles from './block-catalog.module.scss';

const TITLE = 'Discover blocks';

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
  // Opens on the first block not yet added, so the next choice is in view.
  const [selectedType, setSelectedType] = useState(
    () => (entries.find(entry => !chosen.has(entry.type)) ?? entries[0])?.type
  );
  const selected = entries.find(entry => entry.type === selectedType);
  const added = !!selected && chosen.has(selected.type);

  const columns = (
    <div className={moduleStyles.columns}>
      <ul className={moduleStyles.list} aria-label="New blocks">
        {entries.map(entry => (
          <li key={entry.type}>
            <button
              type="button"
              className={moduleStyles.listItem}
              aria-current={entry.type === selectedType ? 'true' : undefined}
              onClick={() => setSelectedType(entry.type)}
            >
              <span className={moduleStyles.listTitle}>{entry.help.title}</span>
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
            </div>
            <div className={moduleStyles.infoRow}>
              {selected.help.animation ? (
                <img
                  className={moduleStyles.animation}
                  src={selected.help.animation.src}
                  alt={selected.help.animation.alt}
                />
              ) : (
                // An empty outline where the block's picture goes, for an
                // entry that has none yet.
                <div
                  className={classNames(
                    moduleStyles.animation,
                    moduleStyles.animationPending
                  )}
                  aria-hidden
                />
              )}
              <div className={moduleStyles.infoText}>
                <p className={moduleStyles.summary}>{selected.help.summary}</p>
                {selected.help.body && (
                  <Markdown
                    content={selected.help.body}
                    className={moduleStyles.body}
                  />
                )}
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
  );
  return (
    <div className={moduleStyles.dialogHost}>
      <Modal
        title={TITLE}
        description="Pick a block to read about it, then add it to your toolbox."
        className={moduleStyles.dialog}
        onClose={onClose}
        customContent={columns}
        primaryButtonProps={{children: 'Done', onClick: onClose}}
      />
    </div>
  );
};

export default BlockCatalogDialog;
