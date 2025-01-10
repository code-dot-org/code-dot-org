import React, {useEffect, useState} from 'react';

import {MazeCell} from '../../types';

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

  if (!gridSize && !initialGrid) {
    return (
      <div>
        You must either specify a grid size and generate an empty grid or have
        an existing grid to edit and click edit existing grid.
      </div>
    );
  }

  console.log({grid});

  return <div />;
};

export default NeighborhoodGridGenerator;
