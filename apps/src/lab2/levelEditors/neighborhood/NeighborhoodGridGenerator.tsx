import React, {useEffect, useMemo, useState} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';

import {MazeCell} from '../../types';

import {categories, imageTiles} from './constants';

import moduleStyles from './neighborhood-grid-generator.module.scss';

interface NeighborhoodGridGeneratorProps {
  setMaze: (maze: string) => void;
  gridSize?: number;
  initialGrid?: string;
}

const NeighborhoodGridGenerator: React.FunctionComponent<
  NeighborhoodGridGeneratorProps
> = ({setMaze, gridSize, initialGrid}) => {
  const [grid, setGrid] = useState<MazeCell[][] | undefined>();
  const [selectedCell, setSelectedCell] = useState<
    [number, number] | undefined
  >(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>('Benches');

  const categoryTiles = useMemo(() => {
    const tileDefinitions = categories[selectedCategory];
    if (Array.isArray(tileDefinitions)) {
      return tileDefinitions;
    } else {
      const tiles = [];
      for (let i = tileDefinitions.min; i <= tileDefinitions.max; i++) {
        tiles.push(i);
      }
      return tiles;
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (gridSize) {
      setGrid(
        Array(gridSize).fill(
          Array(gridSize).fill({tileType: 1, value: 0, assetId: 0})
        )
      );
    } else if (initialGrid) {
      setGrid(JSON.parse(initialGrid!));
    }
  }, [gridSize, initialGrid]);

  if (!grid) {
    return (
      <div>
        You must either specify a grid size and generate an empty grid or have
        an existing grid to edit and click edit existing grid.
      </div>
    );
  }

  const gridDimension = grid.length;
  const cellSize = 400 / gridDimension;
  const categoryOptions = Object.keys(categories).map(category => ({
    value: category,
    text: category,
  }));
  const categoryColumns = 8;
  const categoryRows = Math.ceil(categoryTiles.length / categoryColumns);

  const selectTile = (tile: number) => {
    if (selectedCell) {
      let value = 0;
      if (tile === 303) {
        const promptResult = prompt('How much paint?');
        value = promptResult ? parseInt(promptResult) : 0;
      }
      const newGrid = grid.map((row, rowIndex) =>
        row.map((cell, columnIndex) => {
          if (rowIndex === selectedCell[0] && columnIndex === selectedCell[1]) {
            return {...cell, assetId: tile, value};
          }
          return cell;
        })
      );
      setGrid(newGrid);
    }
  };

  return (
    <div>
      <div className={moduleStyles.gridGenerator}>
        <div
          className={moduleStyles.gridContainer}
          style={{
            gridTemplateColumns: `repeat(${gridDimension}, 1fr)`,
            gridTemplateRows: `repeat(${gridDimension}, 1fr)`,
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, columnIndex) => {
              const isSelected =
                (selectedCell &&
                  selectedCell[0] === rowIndex &&
                  selectedCell[1] === columnIndex) ||
                false;
              return (
                <img
                  src={imageTiles[cell.assetId]}
                  alt="neighborhood cell"
                  width={cellSize}
                  height={cellSize}
                  className={isSelected ? moduleStyles.selectedCell : undefined}
                  onClick={() => setSelectedCell([rowIndex, columnIndex])}
                />
              );
            })
          )}
        </div>
        <div>
          <SimpleDropdown
            items={categoryOptions}
            onChange={e => setSelectedCategory(e.target.value)}
            labelText={'Category'}
            name={'category'}
          />
          <div
            className={moduleStyles.categoryTiles}
            style={{
              gridTemplateRows: `repeat(${categoryRows}, 1fr)`,
              gridTemplateColumns: `repeat(${categoryColumns}, 1fr)`,
            }}
          >
            {categoryTiles.map((tile, index) => (
              <img
                src={imageTiles[tile]}
                alt="neighborhood tile"
                onClick={() => selectTile(tile)}
              />
            ))}
          </div>
        </div>
      </div>
      <Button
        onClick={() => setMaze(JSON.stringify(grid))}
        text="Save grid to serialized maze"
        className={moduleStyles.saveButton}
        type={'secondary'}
      />
    </div>
  );
};

export default NeighborhoodGridGenerator;
