import React from 'react';

interface NeighborhoodGridGeneratorProps {
  setMaze: (maze: string) => void;
  gridSize?: number;
  initialGrid?: string;
}

const NeighborhoodGridGenerator: React.FunctionComponent<
  NeighborhoodGridGeneratorProps
> = ({setMaze, gridSize, initialGrid}) => {
  if (!gridSize && !initialGrid) {
    return (
      <div>
        You must either specify a grid size and generate an empty grid or have
        an existing grid to edit and click edit existing grid.
      </div>
    );
  }
  return <div />;
};

export default NeighborhoodGridGenerator;
