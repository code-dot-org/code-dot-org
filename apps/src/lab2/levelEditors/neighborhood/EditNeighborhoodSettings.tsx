import React from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import Slider from '@cdo/apps/componentLibrary/slider';
import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import {MazeCell} from '@cdo/apps/lab2/types';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import NeighborhoodMazeGenerator from './NeighborhoodMazeGenerator';

import moduleStyles from './edit-neighborhood-settings.module.scss';

interface EditNeighborhoodSettingsProps {
  initialMaze: MazeCell[][];
}

const EditNeighborhoodSettings: React.FunctionComponent<
  EditNeighborhoodSettingsProps
> = ({initialMaze}) => {
  const [maze, setMaze] = React.useState(JSON.stringify(initialMaze));
  const [mazeSize, setMazeSize] = React.useState(8);
  const [mazeSizeToSend, setMazeSizeToSend] = React.useState(8);
  const [showMazeGenerator, setShowMazeGenerator] = React.useState(false);
  const [sendMaze, setSendMaze] = React.useState(false);

  const generateEmptyMaze = () => {
    setSendMaze(false);
    setMazeSizeToSend(mazeSize);
    setShowMazeGenerator(true);
  };

  const editExistingMaze = () => {
    setSendMaze(true);
    setShowMazeGenerator(true);
  };

  return (
    <div>
      <BodyTwoText>Serialized Maze</BodyTwoText>
      <textarea
        value={maze}
        onChange={e => setMaze(e.target.value)}
        rows={20}
        className={moduleStyles.mazeTextArea}
        name="level[serialized_maze]"
      />
      <CollapsibleSection headerContent="Maze Generator">
        <div>
          <div>
            There are two options for creating a maze:
            <ol>
              <li>
                Select a maze size and click "Generate empty maze" to create an
                empty maze with the given dimensions.
              </li>
              <li>
                Click "Edit existing maze" to modify the maze specified in the
                text area above.
              </li>
            </ol>
          </div>
        </div>
        <div className={moduleStyles.mazeSizeControl}>
          <Button
            onClick={generateEmptyMaze}
            text="Generate empty maze"
            type={'secondary'}
            color={'black'}
            size={'s'}
          />
          <Slider
            name="mazeSize"
            value={mazeSize}
            onChange={e => setMazeSize(parseInt(e.target.value))}
            minValue={8}
            maxValue={32}
            label="Maze Size"
          />
        </div>
        <Button
          onClick={editExistingMaze}
          text="Edit existing maze"
          type={'secondary'}
          color={'black'}
          size={'s'}
        />
        {showMazeGenerator && (
          <NeighborhoodMazeGenerator
            saveMaze={setMaze}
            mazeSize={sendMaze ? undefined : mazeSizeToSend}
            initialMaze={sendMaze ? maze : undefined}
          />
        )}
      </CollapsibleSection>
    </div>
  );
};

export default EditNeighborhoodSettings;
