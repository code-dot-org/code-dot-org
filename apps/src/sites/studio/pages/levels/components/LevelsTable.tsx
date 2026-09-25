import React from 'react';

import {Level, CloneResponse} from '../types/levels';

import LevelRow from './LevelRow';

import moduleStyles from '../styles/levels-list.module.scss';

interface LevelsTableProps {
  levels: Level[];
  onClone: (levelId: number, newName: string) => Promise<CloneResponse>;
  onDelete: (levelId: number) => Promise<void>;
  onCloneSuccess: () => void;
  onDeleteSuccess: () => void;
}

const LevelsTable: React.FC<LevelsTableProps> = ({
  levels,
  onClone,
  onDelete,
  onCloneSuccess,
  onDeleteSuccess,
}) => {
  if (levels.length === 0) {
    return <div className={moduleStyles.noLevels}>No levels found.</div>;
  }

  return (
    <table className={moduleStyles.levelsTable}>
      <thead>
        <tr>
          <th className={moduleStyles.controlsColumn} />
          <th>Name</th>
          <th>Type</th>
          <th>Owner</th>
        </tr>
      </thead>
      <tbody>
        {levels.map(level => (
          <LevelRow
            key={level.id}
            level={level}
            onClone={onClone}
            onDelete={onDelete}
            onCloneSuccess={onCloneSuccess}
            onDeleteSuccess={onDeleteSuccess}
          />
        ))}
      </tbody>
    </table>
  );
};

export default LevelsTable;
