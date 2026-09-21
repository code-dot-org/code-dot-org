import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {SceneMetadata} from '../redux/spriteLab2Redux';
import {SceneType} from '../types';

import NewSceneDialog, {SCENE_NAME_MAX_LENGTH} from './NewSceneDialog';
import ScenePicture from './ScenePicture';

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
        <ScenePicture
          src={scene.thumbnail}
          className={moduleStyles.sceneTilePicture}
        />
        {startsHere && (
          <span className={moduleStyles.sceneStartBadge}>Starts here</span>
        )}
      </button>
      {/* The image dialog's rename: a pencil beside the name swaps in a
          field with save and cancel. */}
      <div className={moduleStyles.sceneNameRow}>
        {renaming ? (
          <>
            <TextField
              ref={inputRef}
              name="sceneName"
              aria-label="Scene name"
              className={moduleStyles.sceneNameField}
              size="s"
              value={draft}
              maxLength={SCENE_NAME_MAX_LENGTH}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  commitRename();
                } else if (e.key === 'Escape') {
                  setRenaming(false);
                }
              }}
            />
            <MuiIconButton
              variant="text"
              color="tertiary"
              size="small"
              className={moduleStyles.sceneNameIconButton}
              aria-label="Save name"
              disabled={!draft.trim()}
              onClick={commitRename}
            >
              <FontAwesomeV6Icon iconName="check" />
            </MuiIconButton>
            <MuiIconButton
              variant="text"
              color="tertiary"
              size="small"
              className={moduleStyles.sceneNameIconButton}
              aria-label="Cancel rename"
              onClick={() => setRenaming(false)}
            >
              <FontAwesomeV6Icon iconName="xmark" />
            </MuiIconButton>
          </>
        ) : (
          <>
            <span className={moduleStyles.sceneName}>{scene.name}</span>
            {editable && (
              <MuiIconButton
                variant="text"
                color="tertiary"
                size="small"
                className={moduleStyles.sceneNameIconButton}
                aria-label={`Rename ${scene.name}`}
                onClick={startRename}
              >
                <FontAwesomeV6Icon iconName="pencil" />
              </MuiIconButton>
            )}
          </>
        )}
      </div>
      {editable && !startsHere && (
        <MuiButton
          variant="outlined"
          color="secondary"
          size="extraSmall"
          fullWidth
          onClick={() => onMakeStart(scene.id)}
        >
          Start here
        </MuiButton>
      )}
      {editable && deletable && (
        <div className={moduleStyles.sceneCardFooter}>
          {confirming ? (
            <>
              <span className={moduleStyles.sceneDeleteQuestion}>
                Delete this scene?
              </span>
              <div className={moduleStyles.sceneDeleteChoices}>
                <MuiButton
                  variant="contained"
                  color="error"
                  size="extraSmall"
                  fullWidth
                  onClick={() => onDelete(scene.id)}
                >
                  Delete
                </MuiButton>
                <MuiButton
                  variant="outlined"
                  color="secondary"
                  size="extraSmall"
                  fullWidth
                  onClick={() => setConfirming(false)}
                >
                  Keep
                </MuiButton>
              </div>
            </>
          ) : (
            <MuiButton
              variant="outlined"
              color="secondary"
              size="extraSmall"
              fullWidth
              onClick={() => setConfirming(true)}
            >
              Delete
            </MuiButton>
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
