import React, {useEffect, useMemo, useState} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {MazeCell} from '@cdo/apps/lab2/types';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

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
  const [selectedAsset, setSelectedAsset] = useState<number | undefined>(
    undefined
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('Benches');
  const [selectedPaintAmount, setSelectedPaintAmount] = useState<
    number | undefined
  >(undefined);

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

  const updateCell = (row: number, column: number) => {
    setSelectedCell([row, column]);
    if (selectedAsset !== undefined) {
      let value = 0;
      // Paint bucket asset id is 303
      if (selectedAsset === 303) {
        const promptResult = prompt('How much paint?');
        value = promptResult ? parseInt(promptResult) : 0;
        setSelectedPaintAmount(value);
      } else {
        setSelectedPaintAmount(undefined);
      }
      const newGrid = grid.map((rowDefinition, rowIndex) =>
        rowDefinition.map((cell, columnIndex) => {
          if (rowIndex === row && columnIndex === column) {
            return {...cell, assetId: selectedAsset, value};
          }
          return cell;
        })
      );
      setGrid(newGrid);
    } else {
      // If we are currently on a bucket, show the current amount of paint.
      if (grid[row][column].assetId === 303) {
        setSelectedPaintAmount(grid[row][column].value);
      } else {
        setSelectedPaintAmount(undefined);
      }
    }
  };

  const updateCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedAsset(undefined);
  };

  return (
    <div className={moduleStyles.gridGeneratorContainer}>
      <CollapsibleSection headerContent="How to Use">
        <div>
          <ol>
            <li>Select the category of asset you want to place on the grid.</li>
            <li>Click the asset you want to place on the grid.</li>
            <li>Click the cell you want to place the asset on.</li>
            <li>
              If you want to put the same asset on multiple cells, you just need
              to click the asset once, then click the different cells to place
              it. If you want to have no asset selected, click the Unselect
              Asset button.
            </li>
            <li>
              When you are done, click Save Grid to save your updated grid to
              the serialized maze field. The field will not update until you
              click save!
            </li>
          </ol>
        </div>
      </CollapsibleSection>
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
                  onClick={() => updateCell(rowIndex, columnIndex)}
                  key={`cell-${rowIndex}-${columnIndex}`}
                />
              );
            })
          )}
        </div>
        <div>
          <SimpleDropdown
            items={categoryOptions}
            onChange={updateCategory}
            labelText={'Category'}
            name={'category'}
            className={moduleStyles.categoryDropdown}
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
                onClick={() => setSelectedAsset(tile)}
                className={
                  selectedAsset === tile ? moduleStyles.selectedTile : undefined
                }
                key={`tile-${index}`}
              />
            ))}
          </div>
          <Button
            text="Unselect Asset"
            onClick={() => setSelectedAsset(undefined)}
            type={'secondary'}
            color={'black'}
            className={moduleStyles.unselectButton}
            size={'xs'}
            disabled={selectedAsset === undefined}
          />
        </div>
      </div>
      {selectedPaintAmount !== undefined && (
        <p>Selected paint can amount: {selectedPaintAmount}</p>
      )}
      <Button
        text="Save Grid"
        onClick={() => setMaze(JSON.stringify(grid))}
        className={moduleStyles.saveButton}
      />
    </div>
  );
};

export default NeighborhoodGridGenerator;
