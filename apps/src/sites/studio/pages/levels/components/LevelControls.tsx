import React, {useState} from 'react';

import {Level, CloneResponse} from '../types/levels';

import moduleStyles from '../styles/levels-list.module.scss';

interface LevelControlsProps {
  level: Level;
  onClone: (levelId: number, newName: string) => Promise<CloneResponse>;
  onDelete: (levelId: number) => Promise<void>;
  onCloneSuccess: () => void;
  onDeleteSuccess: () => void;
}

const LevelControls: React.FC<LevelControlsProps> = ({
  level,
  onClone,
  onDelete,
  onCloneSuccess,
  onDeleteSuccess,
}) => {
  const [showCloneForm, setShowCloneForm] = useState(false);
  const [cloneName, setCloneName] = useState(level.name);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);

  const handleCloneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneName.trim()) return;

    setIsCloning(true);
    setCloneError(null);

    try {
      await onClone(level.id, cloneName.trim());
      setShowCloneForm(false);
      setCloneName(level.name);
      onCloneSuccess();
    } catch (error) {
      setCloneError(error instanceof Error ? error.message : 'Clone failed');
    } finally {
      setIsCloning(false);
    }
  };

  const handleDeleteClick = async () => {
    if (
      !window.confirm(`Are you sure you want to delete level "${level.name}"?`)
    ) {
      return;
    }

    try {
      await onDelete(level.id);
      onDeleteSuccess();
    } catch (error) {
      alert(
        `Failed to delete level: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  return (
    <div className={moduleStyles.levelControls}>
      {/* Edit button */}
      {level.permissions.can_edit ? (
        <a href={level.urls.edit} title="Edit">
          <i className="fa fa-fw fa-pencil" />
        </a>
      ) : (
        <i className="fa fa-fw" />
      )}

      {/* Delete button */}
      {level.permissions.can_destroy ? (
        <button
          type="button"
          onClick={handleDeleteClick}
          title="Delete"
          className={moduleStyles.iconButton}
        >
          <i className="fa fa-fw fa-trash" />
        </button>
      ) : (
        <i className="fa fa-fw" />
      )}

      {/* Clone button */}
      {level.permissions.can_clone ? (
        <div className={moduleStyles.cloneContainer}>
          <button
            type="button"
            onClick={() => setShowCloneForm(!showCloneForm)}
            title="Clone"
            className={moduleStyles.iconButton}
          >
            <i className="fa fa-fw fa-copy" />
          </button>

          {showCloneForm && (
            <div className={moduleStyles.cloneForm}>
              <form onSubmit={handleCloneSubmit}>
                <label htmlFor={`clone-name-${level.id}`}>New name:</label>
                <input
                  type="text"
                  id={`clone-name-${level.id}`}
                  value={cloneName}
                  onChange={e => setCloneName(e.target.value)}
                  disabled={isCloning}
                />
                <button type="submit" disabled={isCloning || !cloneName.trim()}>
                  {isCloning ? 'Cloning...' : 'Clone'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCloneForm(false);
                    setCloneError(null);
                  }}
                  disabled={isCloning}
                >
                  Cancel
                </button>
              </form>
              {cloneError && (
                <div className={moduleStyles.cloneError}>{cloneError}</div>
              )}
            </div>
          )}
        </div>
      ) : (
        <i className="fa fa-fw" />
      )}
    </div>
  );
};

export default LevelControls;
