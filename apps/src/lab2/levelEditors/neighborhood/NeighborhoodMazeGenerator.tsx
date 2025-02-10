import {Button} from '@code-dot-org/component-library/button';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {useEffect, useMemo, useState} from 'react';

import {MazeCell} from '@cdo/apps/lab2/types';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import {categories, customTileTypes, imageTiles} from './constants';

import moduleStyles from './neighborhood-maze-generator.module.scss';

interface NeighborhoodMazeGeneratorProps {
  saveMaze: (maze: string) => void;
  mazeSize?: number;
  initialMaze?: string;
}

const NeighborhoodMazeGenerator: React.FunctionComponent<
  NeighborhoodMazeGeneratorProps
> = ({saveMaze, mazeSize, initialMaze}) => {
  const [maze, setMaze] = useState<MazeCell[][] | undefined>();
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
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

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
    if (mazeSize) {
      setMaze(
        Array(mazeSize).fill(
          Array(mazeSize).fill({tileType: 1, value: 0, assetId: 0})
        )
      );
    } else if (initialMaze) {
      setMaze(JSON.parse(initialMaze!));
    }
  }, [mazeSize, initialMaze]);

  if (!maze) {
    return (
      <div>
        You must either specify a maze size and generate an empty maze or have
        an existing maze to edit and click edit existing maze.
      </div>
    );
  }

  const mazeDimension = maze.length;
  const cellSize = 400 / mazeDimension;
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
      const newMaze = maze.map((rowDefinition, rowIndex) =>
        rowDefinition.map((cell, columnIndex) => {
          if (rowIndex === row && columnIndex === column) {
            // Most assets should be designated as tileType 0 (wall), but a few have different tile types.
            const tileType = customTileTypes[selectedAsset] || 0;
            return {...cell, tileType, assetId: selectedAsset, value};
          }
          return cell;
        })
      );
      setShowSaveConfirmation(false);
      setMaze(newMaze);
    } else {
      // If we are currently on a bucket, show the current amount of paint.
      if (maze[row][column].assetId === 303) {
        setSelectedPaintAmount(maze[row][column].value);
      } else {
        setSelectedPaintAmount(undefined);
      }
    }
  };

  const updateCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedAsset(undefined);
  };

  const save = () => {
    saveMaze(JSON.stringify(maze));
    setShowSaveConfirmation(true);
  };

  return (
    <div className={moduleStyles.mazeGeneratorContainer}>
      <CollapsibleSection headerContent="How to Use">
        <div>
          <ol>
            <li>Select the category of asset you want to place on the maze.</li>
            <li>Click the asset you want to place on the maze.</li>
            <li>Click the cell you want to place the asset on.</li>
            <li>
              If you want to put the same asset on multiple cells, you just need
              to click the asset once, then click the different cells to place
              it. If you want to have no asset selected, click the "Unselect
              Asset" button.
            </li>
            <li>
              When you are done, click "Save Maze" to save your updated maze to
              the serialized maze field. The field will not update until you
              click save!
            </li>
          </ol>
        </div>
      </CollapsibleSection>
      <div className={moduleStyles.mazeGenerator}>
        <div
          className={moduleStyles.mazeContainer}
          style={{
            gridTemplateColumns: `repeat(${mazeDimension}, 1fr)`,
            gridTemplateRows: `repeat(${mazeDimension}, 1fr)`,
          }}
        >
          {maze.map((row, rowIndex) =>
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
      <div className={moduleStyles.saveButtonContainer}>
        <Button text="Save Maze" onClick={save} />
        {showSaveConfirmation && (
          <div className={moduleStyles.saveConfirmation}>
            <FontAwesomeV6Icon
              iconName={'circle-check'}
              className={moduleStyles.greenCheck}
            />{' '}
            Saved!
          </div>
        )}
      </div>
    </div>
  );
};

export default NeighborhoodMazeGenerator;
