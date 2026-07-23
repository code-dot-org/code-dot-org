import classNames from 'classnames';
import React, {useMemo, useState} from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {BACKGROUNDS_CATEGORY, BLOCKS_CATEGORY} from '../types';
import {
  createEmptyWorld,
  SCENE_GRID_SIZE,
  SpriteLab2World,
  WorldCell,
} from '../world';

import moduleStyles from './sprite-lab2-view.module.scss';

// The editor draws the grid at a fixed overall size; cells shrink as the
// visible extent grows.
const GRID_PIXELS = 528;

interface PaletteItem extends WorldCell {
  thumb?: string;
}

interface WorldTabProps {
  world?: SpriteLab2World;
  // Visible extent (cells per side): the scene grid by default, the whole
  // world with the world=large parameter. Storage is always the full world,
  // so placements keep their coordinates across the two views.
  displaySize: number;
  // Cell-level so the owner can apply it atomically against saved sources.
  onPaintCell: (row: number, col: number, cell: WorldCell | null) => void;
}

/**
 * The World tab (experiment): paint starter sprites and blocks onto the
 * scene's grid from the project's images, instead of placing them with
 * code. The scene spawns the world's top-left corner when it runs.
 */
const WorldTab: React.FunctionComponent<WorldTabProps> = ({
  world,
  displaySize,
  onPaintCell,
}) => {
  const animationList = useAppSelector(state => state.animationList);
  const palette: PaletteItem[] = useMemo(
    () =>
      animationList.orderedKeys
        .map(key => animationList.propsByKey[key])
        .filter(props => !props.categories?.includes(BACKGROUNDS_CATEGORY))
        .map(props => ({
          image: props.name,
          kind: props.categories?.includes(BLOCKS_CATEGORY)
            ? ('block' as const)
            : ('sprite' as const),
          thumb: props.dataURI || props.sourceUrl,
        })),
    [animationList]
  );
  const thumbsByImage = useMemo(
    () => new Map(palette.map(item => [item.image, item.thumb])),
    [palette]
  );

  const [selected, setSelected] = useState<PaletteItem | 'erase' | null>(null);

  const grid = world?.grid ?? createEmptyWorld().grid;
  const paintCell = (row: number, col: number) => {
    if (!selected) {
      return;
    }
    onPaintCell(
      row,
      col,
      selected === 'erase' ? null : {image: selected.image, kind: selected.kind}
    );
  };

  const cellPixels = GRID_PIXELS / displaySize;
  return (
    <div className={moduleStyles.worldTab}>
      <div className={moduleStyles.worldPalette}>
        {palette.map(item => (
          <button
            key={item.image}
            type="button"
            title={`${item.image} (${item.kind})`}
            className={classNames(
              moduleStyles.worldPaletteItem,
              selected !== 'erase' &&
                selected?.image === item.image &&
                moduleStyles.worldPaletteSelected
            )}
            onClick={() => setSelected(item)}
          >
            {item.thumb && <img src={item.thumb} alt={item.image} />}
          </button>
        ))}
        <button
          type="button"
          className={classNames(
            moduleStyles.worldPaletteItem,
            moduleStyles.worldPaletteErase,
            selected === 'erase' && moduleStyles.worldPaletteSelected
          )}
          onClick={() => setSelected('erase')}
        >
          Erase
        </button>
        {!palette.length && (
          <span className={moduleStyles.worldEmpty}>
            Create some images on the Images tab first.
          </span>
        )}
      </div>
      <div
        className={moduleStyles.worldGrid}
        style={{
          gridTemplateColumns: `repeat(${displaySize}, ${cellPixels}px)`,
        }}
      >
        {Array.from({length: displaySize}, (_, row) =>
          Array.from({length: displaySize}, (_, col) => {
            const cell = grid[row]?.[col];
            const thumb = cell && thumbsByImage.get(cell.image);
            const outsideScene =
              row >= SCENE_GRID_SIZE || col >= SCENE_GRID_SIZE;
            return (
              <button
                key={`${row}-${col}`}
                type="button"
                aria-label={
                  cell ? `${cell.image} at ${row},${col}` : `${row},${col}`
                }
                className={classNames(
                  moduleStyles.worldCell,
                  outsideScene && moduleStyles.worldCellOutside
                )}
                style={{height: cellPixels}}
                onClick={() => paintCell(row, col)}
              >
                {thumb && <img src={thumb} alt="" />}
              </button>
            );
          })
        )}
      </div>
      {displaySize > SCENE_GRID_SIZE && (
        <p className={moduleStyles.worldHint}>
          The scene runs the brighter top-left {SCENE_GRID_SIZE}x
          {SCENE_GRID_SIZE} corner.
        </p>
      )}
    </div>
  );
};

export default WorldTab;
