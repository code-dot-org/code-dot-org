// The records a map holds: what is in it that is not anywhere.
//
// A map is a canvas of POSITIONS, and a record has none — `is data` is the
// absence of the trait that gives an actor a place (specs/RECORDS_PLAN.md).
// So a record cannot be placed, dragged or resized, and everything the stage
// offers is the wrong shape for one.
//
// But a project will want to AUTHOR some: three starting todos, a table of
// levels, the stats a game reads. The map is where a project's authored
// content lives, so the records live there too — in a list beside the canvas
// rather than on it, with the same inspector, the same delete, and no drag.
//
// WHAT MAKES A KIND A RECORD, as far as this is concerned, is that it has no
// position to edit. The schema the sandbox introspects lists a trait group per
// trait the actor HAS, so a kind with no positional trait has no `positional`
// group — which is the same fact said in the one place the editor can see it
// (`MapStage`, `isRecordKind`).

import {Button, Typography} from '@mui/material';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {IconAction} from './IconAction';
import styles from './mapEditor.module.css';
import type {Placement} from './mapModel';

export interface RecordPanelProps {
  /** The placements with no place, in the order the document holds them. */
  records: readonly Placement[];
  /** Every kind the project has that is a record, by module path. */
  kinds: readonly string[];
  selected: string | null;
  onSelect: (id: string) => void;
  onAdd: (type: string) => void;
  onRemove: (id: string) => void;
  isReadOnly: boolean;
  /** What a kind is called, for the Add menu — `actors/note` → `Note`. */
  nameOf: (type: string) => string;
}

export const RecordPanel = ({
  records,
  kinds,
  selected,
  onSelect,
  onAdd,
  onRemove,
  isReadOnly,
  nameOf,
}: RecordPanelProps) => {
  // Nothing to say when the project has no record kinds at all, which is
  // every project that has not asked for one. A panel offering an empty menu
  // is a panel explaining itself to people who do not need it.
  if (kinds.length === 0 && records.length === 0) {
    return null;
  }
  return (
    <div className={styles.records} data-testid="record-panel">
      <Typography variant="subtitle2" component="span">
        Records
      </Typography>
      <ul className={styles.layerList} aria-label="Records this map holds">
        {records.map(record => (
          <li key={record.id}>
            <button
              type="button"
              className={styles.layerRow}
              aria-pressed={record.id === selected}
              onClick={() => onSelect(record.id)}
            >
              {record.id}
              <span className={styles.recordKind}>{nameOf(record.type)}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.layerActions}>
        {kinds.map(kind => (
          <Button
            key={kind}
            variant="outlined"
            color="secondary"
            size="extraSmall"
            startIcon={<FontAwesomeV6Icon iconName="plus" iconStyle="solid" />}
            onClick={() => onAdd(kind)}
            disabled={isReadOnly}
          >
            {`Add ${nameOf(kind)}`}
          </Button>
        ))}
        {/* NAMED for what it removes, because the layer strip beside this
            one has a remove too and a reader hearing two of them cannot tell
            which is which. */}
        <IconAction
          label="Remove record"
          icon="trash"
          onClick={() => selected && onRemove(selected)}
          disabled={isReadOnly || !selected}
        />
      </div>
    </div>
  );
};
