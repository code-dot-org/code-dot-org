import React from 'react';

import {MazeCell} from '@cdo/apps/lab2/types';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

interface EditNeighborhoodSettingsProps {
  initialMaze: MazeCell[][];
}

const EditNeighborhoodSettings: React.FunctionComponent<
  EditNeighborhoodSettingsProps
> = ({initialMaze}) => {
  console.log(initialMaze);
  return (
    <div>
      <CollapsibleSection headerContent="Edit Neighborhood Grid">
        hi
      </CollapsibleSection>
    </div>
  );
};

export default EditNeighborhoodSettings;
