import React from 'react';

import {Level, CloneResponse} from '../types/levels';

import LevelControls from './LevelControls';

import moduleStyles from '../styles/levels-list.module.scss';

interface LevelRowProps {
  level: Level;
  onClone: (levelId: number, newName: string) => Promise<CloneResponse>;
  onDelete: (levelId: number) => Promise<void>;
  onCloneSuccess: () => void;
  onDeleteSuccess: () => void;
}

const LevelRow: React.FC<LevelRowProps> = ({
  level,
  onClone,
  onDelete,
  onCloneSuccess,
  onDeleteSuccess,
}) => {
  return (
    <tr>
      <td className={moduleStyles.controlsColumn}>
        <LevelControls
          level={level}
          onClone={onClone}
          onDelete={onDelete}
          onCloneSuccess={onCloneSuccess}
          onDeleteSuccess={onDeleteSuccess}
        />
      </td>
      <td>
        {level.permissions.can_show ? (
          <a href={level.urls.show} title="Show">
            {level.name}
          </a>
        ) : (
          level.name
        )}
      </td>
      <td>{level.type}</td>
      <td>{level.owner || ''}</td>
    </tr>
  );
};

export default LevelRow;
