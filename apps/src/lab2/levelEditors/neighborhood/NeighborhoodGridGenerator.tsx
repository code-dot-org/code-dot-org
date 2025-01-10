import React, {useEffect, useState} from 'react';

import {MazeCell} from '../../types';

import {imageTiles} from './constants';

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

  console.log({grid});
  grid.map(row => {
    row.map(cell => {
      console.log(cell);
    });
  });

  const gridDimension = grid.length;
  const cellSize = 400 / gridDimension;

  return (
    <div
      className={moduleStyles.gridContainer}
      style={{
        gridTemplateColumns: `repeat(${gridDimension}, 1fr)`,
        gridTemplateRows: `repeat(${gridDimension}, 1fr)`,
      }}
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, cellIndex) => {
          return (
            <img
              src={imageTiles[cell.assetId]}
              alt="neighborhood cell"
              width={cellSize}
              height={cellSize}
              className={moduleStyles.gridCell}
            />
          );
        })
      )}
    </div>
  );
};

export default NeighborhoodGridGenerator;
