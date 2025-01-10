import React from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import Slider from '@cdo/apps/componentLibrary/slider';
import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import {MazeCell} from '@cdo/apps/lab2/types';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import NeighborhoodGridGenerator from './NeighborhoodGridGenerator';

import moduleStyles from './edit-neighborhood-settings.module.scss';

interface EditNeighborhoodSettingsProps {
  initialMaze: MazeCell[][];
}

const EditNeighborhoodSettings: React.FunctionComponent<
  EditNeighborhoodSettingsProps
> = ({initialMaze}) => {
  const [maze, setMaze] = React.useState(JSON.stringify(initialMaze));
  const [gridSize, setGridSize] = React.useState(8);
  const [showGridGenerator, setShowGridGenerator] = React.useState(false);
  const [sendMazeToGrid, setSendMazeToGrid] = React.useState(false);

  const generateEmptyGrid = () => {
    setSendMazeToGrid(false);
    setShowGridGenerator(true);
  };

  const editExistingGrid = () => {
    setSendMazeToGrid(true);
    setShowGridGenerator(true);
  };

  return (
    <div>
      <BodyTwoText>Serialized Maze</BodyTwoText>
      <textarea
        value={maze}
        onChange={e => setMaze(e.target.value)}
        rows={20}
        className={moduleStyles.mazeTextArea}
      />
      <CollapsibleSection headerContent="Grid Generator">
        <div>
          <p>
            There are two options for creating a grid:
            <ol>
              <li>
                Select a grid size and click Generate Empty Grid to create an
                empty grid with the given dimensions.
              </li>
              <li>
                Click "Edit existing grid" to modify the grid specified in the
                text area above.
              </li>
            </ol>
          </p>
        </div>
        <div className={moduleStyles.gridGeneratorControls}>
          <div>
            Grid Size
            <Slider
              name="gridSize"
              value={gridSize}
              onChange={e => setGridSize(parseInt(e.target.value))}
              minValue={8}
              maxValue={32}
            />
            <Button
              onClick={generateEmptyGrid}
              text="Generate Empty Grid"
              type={'secondary'}
              color={'black'}
              size={'s'}
            />
          </div>
          <Button
            onClick={editExistingGrid}
            text="Edit existing grid"
            type={'secondary'}
            color={'black'}
            size={'s'}
          />
        </div>
        {showGridGenerator && (
          <NeighborhoodGridGenerator
            setMaze={setMaze}
            gridSize={sendMazeToGrid ? undefined : gridSize}
            initialGrid={sendMazeToGrid ? maze : undefined}
          />
        )}
      </CollapsibleSection>
    </div>
  );
};

export default EditNeighborhoodSettings;
