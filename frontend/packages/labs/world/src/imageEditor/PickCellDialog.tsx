// Which cell of a spritesheet to draw in.
//
// A frame of a walk cycle is a drawing, and drawing it inside a strip of six
// means aiming at a sixth of the canvas. So the editor can narrow to one cell —
// and this is how you say which. The cells are shown as they are drawn, in
// reading order, because "the third one" is how anybody thinks about a sheet.

import {Typography} from '@mui/material';

import {Dialog} from '@code-dot-org/component-library/dialog';

import {CellThumb} from '../animationEditor/CellThumb';
import cellStyles from '../animationEditor/cellThumb.module.css';
import type {CellRect} from '../animationEditor/sheetFrames';
import {translate} from '../effect/localization';

import styles from './pickCellDialog.module.css';

/** Cells are drawn at 2×, as everywhere else. */
const SCALE = 2;

export interface PickCellDialogProps {
  /** What the cells are drawn from — the editor's live canvas. */
  image: CanvasImageSource;
  /** Its cells, in reading order (sheetFrames). */
  cells: readonly CellRect[];
  /** The cell being edited now, if any. */
  current?: CellRect;
  onPick: (cell: CellRect) => void;
  onCancel: () => void;
}

export const PickCellDialog = ({
  image,
  cells,
  current,
  onPick,
  onCancel,
}: PickCellDialogProps) => (
  <Dialog
    role="dialog"
    title={translate('Choose a cell')}
    description={translate(
      'Only this cell is shown while you draw it. The rest of the sheet is untouched.',
    )}
    onClose={onCancel}
    closeLabel={translate('Close')}
    // A click on a cell is the choice — there is one thing being decided and it
    // is undone from the header — so the only footer button is the way out.
    primaryButtonProps={{
      children: translate('Cancel'),
      onClick: onCancel,
    }}
    customContent={
      cells.length === 0 ? (
        <Typography variant="body2">
          {translate('This sheet has no cells to choose.')}
        </Typography>
      ) : (
        <ul className={styles.grid}>
          {cells.map((cell, index) => {
            const chosen =
              current?.x === cell.x &&
              current?.y === cell.y &&
              current?.width === cell.width;
            return (
              <li key={index}>
                <button
                  type="button"
                  className={
                    chosen
                      ? `${cellStyles.cellButton} ${cellStyles.cellChosen}`
                      : cellStyles.cellButton
                  }
                  aria-label={translate('Cell {n}', {n: String(index + 1)})}
                  aria-current={chosen}
                  onClick={() => onPick(cell)}
                >
                  <CellThumb image={image} cell={cell} scale={SCALE} />
                </button>
              </li>
            );
          })}
        </ul>
      )
    }
  />
);

export default PickCellDialog;
