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

import {Typography} from '@mui/material';

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
          <button
            key={kind}
            type="button"
            className={styles.resetButton}
            onClick={() => onAdd(kind)}
            disabled={isReadOnly}
          >
            {`Add ${nameOf(kind)}`}
          </button>
        ))}
        <button
          type="button"
          className={styles.resetButton}
          // NAMED, because the layer strip beside this one also says Remove
          // and a reader hearing two of them cannot tell which is which. The
          // visible word is inside the spoken one, which is what keeps a
          // voice command working (WCAG 2.5.3, label in name).
          aria-label="Remove record"
          onClick={() => selected && onRemove(selected)}
          disabled={isReadOnly || !selected}
        >
          Remove
        </button>
      </div>
    </div>
  );
};
