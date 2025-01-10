import React, {useEffect, useState} from 'react';

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

  return (
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
      </div>
    </div>
  );
};

export default NeighborhoodGridGenerator;
