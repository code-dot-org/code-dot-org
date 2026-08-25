import classNames from 'classnames';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {getTrimmedThumbnail, onTrimsUpdated} from '../imageTrim';
import {BACKGROUNDS_CATEGORY, BLOCKS_CATEGORY} from '../types';
import {createEmptyWorld, SCENE_GRID_SIZE, World, WorldCell} from '../world';

import {PREVIEW_CLEARANCE} from './Playspace';

import moduleStyles from './world-tab.module.scss';

// The editor draws the grid at this overall size when there's room; cells
// shrink as the visible extent grows.
const GRID_PIXELS = 528;
// Short windows shrink the grid to fit, down to this; below it the tab
// scrolls instead (cells get too small to paint).
const MIN_GRID_PIXELS = 320;

interface PaletteItem extends WorldCell {
  thumb?: string;
}

interface WorldTabProps {
  world?: World;
  // Visible extent (cells per side): the scene grid by default, the whole
  // world with the world=large parameter. Storage is always the full world,
  // so placements keep their coordinates across the two views.
  displaySize: number;
  // Cell-level so the owner can apply it atomically against saved sources.
  onPaintCell: (row: number, col: number, cell: WorldCell | null) => void;
  // Palette selection, owned by the view so it survives tab switches (this
  // component unmounts when the tab is hidden).
  selected: WorldCell | 'erase' | null;
  onSelect: (selection: WorldCell | 'erase') => void;
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
  selected,
  onSelect,
}) => {
  const animationList = useAppSelector(state => state.animationList);
  // Thumbnails prefer the engine's trimmed image (a sprite sheet's is its
  // first frame; the raw sheet would show every frame side by side). Trims
  // land as the engine preloads; re-render when they do.
  const [trimVersion, setTrimVersion] = useState(0);
  useEffect(() => onTrimsUpdated(() => setTrimVersion(v => v + 1)), []);
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
          thumb:
            getTrimmedThumbnail(props.name) || props.dataURI || props.sourceUrl,
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animationList, trimVersion]
  );
  const thumbsByImage = useMemo(
    () => new Map(palette.map(item => [item.image, item.thumb])),
    [palette]
  );

  const grid = world?.grid ?? createEmptyWorld().grid;
  const paintCell = (row: number, col: number, erase: boolean) => {
    if (!selected) {
      return;
    }
    onPaintCell(
      row,
      col,
      erase || selected === 'erase'
        ? null
        : {image: selected.image, kind: selected.kind}
    );
  };
  // A press on a tile already holding the selected item erases instead
  // (click-again-to-remove). The pressed tile decides for the whole drag
  // stroke, so dragging across painted tiles doesn't toggle them.
  const strokeErase = useRef(false);
  const startStroke = (row: number, col: number) => {
    strokeErase.current =
      selected !== 'erase' && grid[row]?.[col]?.image === selected?.image;
    paintCell(row, col, strokeErase.current);
  };

  // Shrink the grid to the vertical room left after the palette (see
  // worldGridArea): full size when it fits, floored so cells stay paintable.
  const gridAreaRef = useRef<HTMLDivElement | null>(null);
  const [gridPixels, setGridPixels] = useState(GRID_PIXELS);
  useEffect(() => {
    const area = gridAreaRef.current;
    if (!area) {
      return;
    }
    const observer = new ResizeObserver(() => {
      setGridPixels(
        Math.max(MIN_GRID_PIXELS, Math.min(GRID_PIXELS, area.clientHeight))
      );
    });
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

  const cellPixels = gridPixels / displaySize;
  return (
    <div
      className={moduleStyles.worldTab}
      style={{paddingRight: PREVIEW_CLEARANCE}}
    >
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
            onClick={() => onSelect({image: item.image, kind: item.kind})}
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
          onClick={() => onSelect('erase')}
        >
          Erase
        </button>
        {!palette.length && (
          <span className={moduleStyles.worldEmpty}>
            Create some images on the Images tab first.
          </span>
        )}
      </div>
      <div ref={gridAreaRef} className={moduleStyles.worldGridArea}>
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
                  // Touch implicitly captures the pointer on the pressed cell,
                  // which would keep drag painting's enter events from the
                  // neighbors — release it.
                  onPointerDown={e => {
                    e.currentTarget.releasePointerCapture?.(e.pointerId);
                    startStroke(row, col);
                  }}
                  onPointerEnter={e => {
                    if (e.buttons & 1) {
                      paintCell(row, col, strokeErase.current);
                    }
                  }}
                  // Pointer presses painted above; this is keyboard activation.
                  onClick={e => {
                    if (e.detail === 0) {
                      startStroke(row, col);
                    }
                  }}
                >
                  {thumb && <img src={thumb} alt="" />}
                </button>
              );
            })
          )}
        </div>
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
