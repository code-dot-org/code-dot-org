import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {SceneMetadata} from '../redux/spriteLab2Redux';
import {SceneType} from '../types';

import NewSceneDialog, {SCENE_NAME_MAX_LENGTH} from './NewSceneDialog';

import moduleStyles from './sprite-lab2-view.module.scss';

interface SceneCardProps {
  scene: SceneMetadata;
  active: boolean;
  /** The first scene: where Play and other projects' jumps begin. */
  startsHere: boolean;
  /** The last scene can't be deleted: a project always has one. */
  deletable: boolean;
  editable: boolean;
  onOpen: (sceneId: string) => void;
  onRename: (sceneId: string, name: string) => void;
  onDelete: (sceneId: string) => void;
  onMakeStart: (sceneId: string) => void;
}

const SceneCard: React.FunctionComponent<SceneCardProps> = ({
  scene,
  active,
  startsHere,
  deletable,
  editable,
  onOpen,
  onRename,
  onDelete,
  onMakeStart,
}) => {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(scene.name);
  const [confirming, setConfirming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) {
      inputRef.current?.select();
    }
  }, [renaming]);

  const commitRename = useCallback(() => {
    const name = draft.trim();
    if (name && name !== scene.name) {
      onRename(scene.id, name);
    }
    setRenaming(false);
  }, [draft, scene.id, scene.name, onRename]);

  const startRename = () => {
    setDraft(scene.name);
    setRenaming(true);
  };

  return (
    <div
      className={classNames(
        moduleStyles.sceneCard,
        active && moduleStyles.sceneCardActive
      )}
    >
      <button
        type="button"
        className={moduleStyles.sceneTile}
        aria-label={`Open ${scene.name}`}
        onClick={() => onOpen(scene.id)}
      >
        {scene.thumbnail ? (
          <img src={scene.thumbnail} alt="" />
        ) : (
          <FontAwesomeV6Icon iconName="image" iconStyle="regular" />
        )}
        {startsHere && (
          <span className={moduleStyles.sceneStartBadge}>
            <FontAwesomeV6Icon iconName="flag" iconStyle="solid" />
            Starts here
          </span>
        )}
      </button>
      {renaming ? (
        // A bare input: the design system's TextField carries a label and
        // helper row, and this edits the caption in place under the tile.
        <input
          ref={inputRef}
          className={moduleStyles.sceneNameInput}
          aria-label="Scene name"
          value={draft}
          maxLength={SCENE_NAME_MAX_LENGTH}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              commitRename();
            } else if (e.key === 'Escape') {
              setRenaming(false);
            }
          }}
        />
      ) : (
        <button
          type="button"
          className={moduleStyles.sceneNameButton}
          title={editable ? 'Rename' : undefined}
          aria-label={editable ? `Rename ${scene.name}` : undefined}
          disabled={!editable}
          onClick={startRename}
        >
          {scene.name}
        </button>
      )}
      {editable && (
        <div className={moduleStyles.sceneCardActions}>
          {confirming ? (
            <>
              <span>Delete this scene?</span>
              <MuiButton
                variant="contained"
                color="error"
                size="extraSmall"
                onClick={() => onDelete(scene.id)}
              >
                Delete
              </MuiButton>
              <MuiButton
                variant="outlined"
                color="secondary"
                size="extraSmall"
                onClick={() => setConfirming(false)}
              >
                Keep
              </MuiButton>
            </>
          ) : (
            <>
              {!startsHere && (
                <MuiButton
                  variant="text"
                  color="secondary"
                  size="extraSmall"
                  onClick={() => onMakeStart(scene.id)}
                >
                  Start here
                </MuiButton>
              )}
              {deletable && (
                <MuiButton
                  variant="text"
                  color="secondary"
                  size="extraSmall"
                  onClick={() => setConfirming(true)}
                >
                  Delete
                </MuiButton>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

interface ScenesGalleryProps {
  scenes: SceneMetadata[];
  activeSceneId: string | null;
  /** Whether scenes can be added, renamed, reordered and deleted here. */
  editable: boolean;
  onOpenScene: (sceneId: string) => void;
  onCreateScene: (name: string, type: SceneType) => void;
  onRenameScene: (sceneId: string, name: string) => void;
  onDeleteScene: (sceneId: string) => void;
  onMakeStartScene: (sceneId: string) => void;
}

/**
 * The Scenes view: every scene as a card (picture, name, actions), in play
 * order, with a "new scene" card first. Opening a card goes to that scene's
 * Code tab.
 */
const ScenesGallery: React.FunctionComponent<ScenesGalleryProps> = ({
  scenes,
  activeSceneId,
  editable,
  onOpenScene,
  onCreateScene,
  onRenameScene,
  onDeleteScene,
  onMakeStartScene,
}) => {
  const [naming, setNaming] = useState(false);
  return (
    <div className={moduleStyles.imageGallery}>
      {editable && (
        <div className={moduleStyles.sceneCard}>
          <button
            type="button"
            className={moduleStyles.newSceneCard}
            onClick={() => setNaming(true)}
          >
            <span aria-hidden>+</span>
            <span className={moduleStyles.newImageLabel}>New scene</span>
          </button>
        </div>
      )}
      {scenes.map((scene, index) => (
        <SceneCard
          key={scene.id}
          scene={scene}
          active={scene.id === activeSceneId}
          startsHere={index === 0}
          deletable={scenes.length > 1}
          editable={editable}
          onOpen={onOpenScene}
          onRename={onRenameScene}
          onDelete={onDeleteScene}
          onMakeStart={onMakeStartScene}
        />
      ))}
      {naming && (
        <NewSceneDialog
          onCreate={onCreateScene}
          onClose={() => setNaming(false)}
        />
      )}
    </div>
  );
};

export default ScenesGallery;
